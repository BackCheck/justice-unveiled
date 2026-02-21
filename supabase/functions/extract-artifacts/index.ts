import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { uploadId, caseId, scanAll } = await req.json();

    // Determine which uploads to scan
    let uploads: any[] = [];
    if (scanAll) {
      let query = supabase.from("evidence_uploads").select("id, file_name, description, case_id, storage_path, file_type");
      if (caseId) query = query.eq("case_id", caseId);
      const { data } = await query;
      uploads = data || [];
    } else if (uploadId) {
      const { data } = await supabase.from("evidence_uploads").select("id, file_name, description, case_id, storage_path, file_type").eq("id", uploadId).single();
      if (data) uploads = [data];
    }

    if (uploads.length === 0) {
      return new Response(JSON.stringify({ error: "No uploads found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let totalArtifacts = 0;

    for (const upload of uploads) {
      // Check if already scanned
      const { count } = await supabase
        .from("evidence_artifacts")
        .select("id", { count: "exact", head: true })
        .eq("evidence_upload_id", upload.id);

      if ((count || 0) > 0) {
        console.log(`Skipping ${upload.file_name} — already has artifacts`);
        continue;
      }

      // Fetch file content
      let textContent = "";
      let fileBase64: string | null = null;
      let fileMimeType: string | null = null;

      const isPdf = upload.file_name?.toLowerCase().endsWith(".pdf");
      const isImage = /\.(png|jpg|jpeg|gif|webp|bmp|tiff)$/i.test(upload.file_name || "");
      const isText = /\.(txt|md|csv|json|log)$/i.test(upload.file_name || "");
      const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(upload.file_name || "");

      if (upload.storage_path) {
        try {
          const { data: fileData, error } = await supabase.storage.from("evidence").download(upload.storage_path);
          if (error) {
            console.error(`Download error for ${upload.file_name}:`, error);
            continue;
          }
          if (isText) {
            textContent = await fileData.text();
          } else if (isPdf || isImage || isAudio) {
            const arrayBuffer = await fileData.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = "";
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
              binary += String.fromCharCode(...chunk);
            }
            fileBase64 = btoa(binary);
            if (isPdf) fileMimeType = "application/pdf";
            else if (isImage) fileMimeType = "image/png";
            else {
              const ext = upload.file_name.split(".").pop()?.toLowerCase();
              const mimeMap: Record<string, string> = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac" };
              fileMimeType = mimeMap[ext || ""] || "audio/mpeg";
            }
          }
        } catch (err) {
          console.error(`Failed to fetch ${upload.file_name}:`, err);
          continue;
        }
      }

      if (!textContent && !fileBase64) {
        // Use description as fallback
        textContent = upload.description || "";
        if (!textContent) continue;
      }

      // Truncate text
      if (textContent.length > 300000) {
        textContent = textContent.substring(0, 300000);
      }

      // Build AI request
      const userParts: any[] = [];
      if (fileBase64) {
        userParts.push({
          type: "text",
          text: `Extract ALL communication artifacts from this document "${upload.file_name}". Find every phone number, email address, IP address, URL, cryptocurrency address, and any other identifiable contact or digital artifact. Also note any communication transcripts or metadata present.`,
        });
        userParts.push({
          type: "image_url",
          image_url: { url: `data:${fileMimeType};base64,${fileBase64}` },
        });
      } else {
        userParts.push({
          type: "text",
          text: `Extract ALL communication artifacts from this document "${upload.file_name}":\n\n${textContent}\n\nFind every phone number, email address, IP address, URL, cryptocurrency address, and any other identifiable contact or digital artifact. Also note any communication transcripts or metadata present.`,
        });
      }

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a forensic document analyst. Extract every identifiable artifact from documents. Be extremely thorough.`,
            },
            { role: "user", content: userParts },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_artifacts",
                description: "Report all extracted artifacts from the document",
                parameters: {
                  type: "object",
                  properties: {
                    artifacts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          artifact_type: {
                            type: "string",
                            enum: ["phone", "email", "ip_address", "url", "crypto_address", "hash", "date_reference", "communication_transcript", "metadata", "physical_address", "id_number", "bank_account"],
                          },
                          value: { type: "string", description: "The actual artifact value (phone number, email, IP, etc.)" },
                          context: { type: "string", description: "Surrounding context or sentence where this artifact appeared (max 200 chars)" },
                          extra_info: {
                            type: "object",
                            description: "Additional metadata like country code for phone, domain for email, hash algorithm, etc.",
                            properties: {
                              country: { type: "string" },
                              domain: { type: "string" },
                              algorithm: { type: "string" },
                              label: { type: "string" },
                            },
                          },
                        },
                        required: ["artifact_type", "value"],
                      },
                    },
                  },
                  required: ["artifacts"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_artifacts" } },
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error(`AI error for ${upload.file_name}: ${aiResp.status} - ${errText}`);
        continue;
      }

      const aiData = await aiResp.json();
      let artifacts: any[] = [];
      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments);
          artifacts = parsed.artifacts || [];
        }
      } catch (parseErr) {
        console.error(`Parse error for ${upload.file_name}:`, parseErr);
        continue;
      }

      // Insert artifacts
      if (artifacts.length > 0) {
        const rows = artifacts.map((a: any) => ({
          evidence_upload_id: upload.id,
          case_id: upload.case_id,
          artifact_type: a.artifact_type,
          artifact_value: a.value,
          context_snippet: (a.context || "").substring(0, 500),
          metadata: a.extra_info || {},
        }));

        const { error: insertErr } = await supabase.from("evidence_artifacts").insert(rows);
        if (insertErr) {
          console.error(`Insert error for ${upload.file_name}:`, insertErr);
        } else {
          totalArtifacts += artifacts.length;
          console.log(`Extracted ${artifacts.length} artifacts from ${upload.file_name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, totalArtifacts, uploadsScanned: uploads.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-artifacts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
