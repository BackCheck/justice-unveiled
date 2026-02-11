import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number, code: string) {
  return jsonResponse({ error: { code, message, status } }, status);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Support both path-based (/public-api/cases) and query-based (?resource=cases)
  const lastPart = pathParts[pathParts.length - 1] || "";
  const resource = (lastPart === "public-api" || lastPart === "") 
    ? (url.searchParams.get("resource") || "") 
    : lastPart;
  const resourceId = url.searchParams.get("id");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25")));
  const offset = (page - 1) * limit;
  const search = url.searchParams.get("search") || "";
  const caseId = url.searchParams.get("case_id") || "";
  const category = url.searchParams.get("category") || "";
  const severity = url.searchParams.get("severity") || "";
  const sortBy = url.searchParams.get("sort_by") || "created_at";
  const sortOrder = url.searchParams.get("sort_order") === "asc" ? true : false;

  if (req.method !== "GET") {
    return errorResponse("Only GET requests are supported. This is a read-only API.", 405, "METHOD_NOT_ALLOWED");
  }

  try {
    switch (resource) {
      // ── Cases ──
      case "cases": {
        if (resourceId) {
          const { data, error } = await supabase
            .from("cases")
            .select("*")
            .eq("id", resourceId)
            .single();
          if (error || !data) return errorResponse("Case not found", 404, "NOT_FOUND");
          return jsonResponse({ data });
        }
        let query = supabase.from("cases").select("*", { count: "exact" });
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,case_number.ilike.%${search}%`);
        if (category) query = query.eq("category", category);
        if (severity) query = query.eq("severity", severity);
        const validSorts = ["created_at", "updated_at", "title", "case_number", "status", "severity"];
        const sort = validSorts.includes(sortBy) ? sortBy : "created_at";
        query = query.order(sort, { ascending: sortOrder }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Events ──
      case "events": {
        if (resourceId) {
          const { data, error } = await supabase.from("extracted_events").select("*").eq("id", resourceId).single();
          if (error || !data) return errorResponse("Event not found", 404, "NOT_FOUND");
          return jsonResponse({ data });
        }
        let query = supabase.from("extracted_events").select("*", { count: "exact" }).eq("is_hidden", false);
        if (caseId) query = query.eq("case_id", caseId);
        if (category) query = query.eq("category", category);
        if (search) query = query.or(`description.ilike.%${search}%,individuals.ilike.%${search}%`);
        const validSorts = ["created_at", "date", "category"];
        const sort = validSorts.includes(sortBy) ? sortBy : "date";
        query = query.order(sort, { ascending: sortOrder }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Entities ──
      case "entities": {
        if (resourceId) {
          const { data, error } = await supabase.from("extracted_entities").select("*").eq("id", resourceId).single();
          if (error || !data) return errorResponse("Entity not found", 404, "NOT_FOUND");
          return jsonResponse({ data });
        }
        let query = supabase.from("extracted_entities").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (category) query = query.eq("entity_type", category);
        if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        const validSorts = ["created_at", "name", "entity_type", "influence_score"];
        const sort = validSorts.includes(sortBy) ? sortBy : "created_at";
        query = query.order(sort, { ascending: sortOrder }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Entity Relationships ──
      case "relationships": {
        let query = supabase.from("entity_relationships").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (category) query = query.eq("relationship_type", category);
        query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Violations (Compliance) ──
      case "violations": {
        let query = supabase.from("compliance_violations").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (severity) query = query.eq("severity", severity);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        query = query.order("flagged_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Legal Claims ──
      case "claims": {
        let query = supabase.from("legal_claims").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (category) query = query.eq("claim_type", category);
        if (search) query = query.or(`allegation_text.ilike.%${search}%`);
        query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Legal Statutes ──
      case "statutes": {
        let query = supabase.from("legal_statutes").select("*", { count: "exact" });
        if (category) query = query.eq("framework", category);
        if (search) query = query.or(`statute_name.ilike.%${search}%,title.ilike.%${search}%,summary.ilike.%${search}%`);
        query = query.order("statute_code", { ascending: true }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Case Law Precedents ──
      case "precedents": {
        if (resourceId) {
          const { data, error } = await supabase.from("case_law_precedents").select("*").eq("id", resourceId).single();
          if (error || !data) return errorResponse("Precedent not found", 404, "NOT_FOUND");
          return jsonResponse({ data });
        }
        let query = supabase.from("case_law_precedents").select("*", { count: "exact" });
        if (category) query = query.eq("jurisdiction", category);
        if (search) query = query.or(`case_name.ilike.%${search}%,citation.ilike.%${search}%,summary.ilike.%${search}%`);
        query = query.order("year", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Discrepancies ──
      case "discrepancies": {
        let query = supabase.from("extracted_discrepancies").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (severity) query = query.eq("severity", severity);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Harm Incidents ──
      case "harm-incidents": {
        let query = supabase.from("regulatory_harm_incidents").select("*", { count: "exact" });
        if (caseId) query = query.eq("case_id", caseId);
        if (severity) query = query.eq("severity", severity);
        query = query.order("incident_date", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Blog Posts ──
      case "blog": {
        if (resourceId) {
          const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", resourceId).eq("is_published", true).single();
          if (error || !data) return errorResponse("Post not found", 404, "NOT_FOUND");
          return jsonResponse({ data });
        }
        let query = supabase.from("blog_posts").select("id,title,slug,excerpt,category,tags,author_name,published_at,cover_image_url,views_count", { count: "exact" }).eq("is_published", true);
        if (category) query = query.eq("category", category);
        if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
        query = query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return jsonResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }

      // ── Stats ──
      case "stats": {
        const [cases, events, entities, violations, claims, precedents] = await Promise.all([
          supabase.from("cases").select("id", { count: "exact", head: true }),
          supabase.from("extracted_events").select("id", { count: "exact", head: true }).eq("is_hidden", false),
          supabase.from("extracted_entities").select("id", { count: "exact", head: true }),
          supabase.from("compliance_violations").select("id", { count: "exact", head: true }),
          supabase.from("legal_claims").select("id", { count: "exact", head: true }),
          supabase.from("case_law_precedents").select("id", { count: "exact", head: true }),
        ]);
        return jsonResponse({
          data: {
            total_cases: cases.count || 0,
            total_events: events.count || 0,
            total_entities: entities.count || 0,
            total_violations: violations.count || 0,
            total_claims: claims.count || 0,
            total_precedents: precedents.count || 0,
          },
        });
      }

      default:
        return jsonResponse({
          api: "HRPM Public API",
          version: "1.0",
          documentation: "https://hrpm.lovable.app/api",
          endpoints: [
            "GET ?resource=cases",
            "GET ?resource=events",
            "GET ?resource=entities",
            "GET ?resource=relationships",
            "GET ?resource=violations",
            "GET ?resource=claims",
            "GET ?resource=statutes",
            "GET ?resource=precedents",
            "GET ?resource=discrepancies",
            "GET ?resource=harm-incidents",
            "GET ?resource=blog",
            "GET ?resource=stats",
          ],
          parameters: {
            id: "Resource ID for single item lookup",
            page: "Page number (default: 1)",
            limit: "Items per page (max: 100, default: 25)",
            search: "Full-text search query",
            case_id: "Filter by case UUID",
            category: "Filter by category/type",
            severity: "Filter by severity level",
            sort_by: "Sort field name",
            sort_order: "asc or desc (default: desc)",
          },
        });
    }
  } catch (err) {
    console.error("Public API error:", err);
    return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
  }
});
