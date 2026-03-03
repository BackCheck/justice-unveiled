import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user session
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin/editor role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["admin", "editor"].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { winner_entity_id, loser_entity_id, reason, review_queue_id } = await req.json();

    if (!winner_entity_id || !loser_entity_id) {
      return new Response(JSON.stringify({ error: "winner_entity_id and loser_entity_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Snapshot the loser entity before merge
    const { data: loserEntity } = await adminClient
      .from("entities")
      .select("*")
      .eq("id", loser_entity_id)
      .single();

    if (!loserEntity) {
      return new Response(JSON.stringify({ error: "Loser entity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Move aliases from loser to winner
    await adminClient
      .from("entity_aliases_v2")
      .update({ entity_id: winner_entity_id })
      .eq("entity_id", loser_entity_id);

    // Add loser's primary name as an alias of winner
    const { data: winnerEntity } = await adminClient
      .from("entities")
      .select("normalized_name")
      .eq("id", winner_entity_id)
      .single();

    if (winnerEntity) {
      await adminClient.from("entity_aliases_v2").insert({
        entity_id: winner_entity_id,
        alias_name: loserEntity.primary_name,
        alias_normalized: loserEntity.normalized_name,
        source: "MERGE",
      });
    }

    // 3. Repoint case_entity_roles
    // Get existing winner roles to avoid duplicates
    const { data: winnerRoles } = await adminClient
      .from("case_entity_roles")
      .select("case_id, role")
      .eq("entity_id", winner_entity_id);

    const winnerRoleSet = new Set(
      (winnerRoles || []).map((r: any) => `${r.case_id}:${r.role}`)
    );

    const { data: loserRoles } = await adminClient
      .from("case_entity_roles")
      .select("*")
      .eq("entity_id", loser_entity_id);

    for (const lr of loserRoles || []) {
      const key = `${lr.case_id}:${lr.role}`;
      if (!winnerRoleSet.has(key)) {
        await adminClient
          .from("case_entity_roles")
          .update({ entity_id: winner_entity_id })
          .eq("id", lr.id);
      } else {
        await adminClient.from("case_entity_roles").delete().eq("id", lr.id);
      }
    }

    // 4. Repoint entity_relationships
    await adminClient
      .from("entity_relationships")
      .update({ source_entity_id: winner_entity_id })
      .eq("source_entity_id", loser_entity_id);

    await adminClient
      .from("entity_relationships")
      .update({ target_entity_id: winner_entity_id })
      .eq("target_entity_id", loser_entity_id);

    // Remove self-referencing relationships
    await adminClient
      .from("entity_relationships")
      .delete()
      .eq("source_entity_id", winner_entity_id)
      .eq("target_entity_id", winner_entity_id);

    // 5. Set loser status to MERGED
    await adminClient
      .from("entities")
      .update({ status: "MERGED", updated_at: new Date().toISOString() })
      .eq("id", loser_entity_id);

    // 6. Insert merge history
    await adminClient.from("entity_merge_history").insert({
      winner_entity_id,
      loser_entity_id,
      merged_by: user.id,
      reason: reason || "Manual merge via review queue",
      snapshot: loserEntity,
    });

    // 7. Update review queue item if provided
    if (review_queue_id) {
      await adminClient
        .from("entity_review_queue")
        .update({ status: "MERGED" })
        .eq("id", review_queue_id);
    }

    // 8. Audit log
    await adminClient.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "MERGE",
      table_name: "entities",
      record_id: winner_entity_id,
      old_data: loserEntity,
      new_data: { winner_entity_id, loser_entity_id, reason },
    });

    return new Response(
      JSON.stringify({
        success: true,
        winner_entity_id,
        loser_entity_id,
        message: `Merged "${loserEntity.primary_name}" into winner entity`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Merge error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
