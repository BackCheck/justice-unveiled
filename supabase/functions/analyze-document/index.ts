import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedEvent {
  date: string;
  category: "Business Interference" | "Harassment" | "Legal Proceeding" | "Criminal Allegation";
  description: string;
  individuals: string;
  legalAction: string;
  outcome: string;
  evidenceDiscrepancy: string;
  sources: string;
  confidenceScore: number;
}

interface ExtractedEntity {
  name: string;
  entityType: "Person" | "Organization" | "Official Body" | "Legal Entity";
  role: string;
  description: string;
}

interface ExtractedDiscrepancy {
  discrepancyType: "Procedural Failure" | "Chain of Custody" | "Testimony Contradiction" | "Document Forgery" | "Timeline Inconsistency" | "Other";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  legalReference: string;
  relatedDates: string[];
}

interface ExtractionResult {
  events: ExtractedEvent[];
  entities: ExtractedEntity[];
  discrepancies: ExtractedDiscrepancy[];
}

// Validate and normalize date to YYYY-MM-DD format
function normalizeDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Clean up the date string
  const cleaned = dateStr.trim().replace(/\.$/, ''); // Remove trailing period
  
  // Check if already valid YYYY-MM-DD format
  const validFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (validFormat.test(cleaned)) {
    const [year, month, day] = cleaned.split('-').map(Number);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return cleaned;
    }
  }
  
  // Try to extract first valid date from malformed strings like "2024-11-2024-11-21"
  const dateMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${year}-${month}-${day}`;
    }
  }
  
  // Try parsing date range format like "2024-10-16-2024-11-07" - use first date
  const rangeMatch = cleaned.match(/^(\d{4}-\d{2}-\d{2})-\d{4}-\d{2}-\d{2}$/);
  if (rangeMatch) {
    return rangeMatch[1];
  }
  
  // Remove timezone suffixes and retry
  const withoutTz = cleaned.replace(/\s+[A-Za-z_\/]+$/, '');
  if (withoutTz !== cleaned && validFormat.test(withoutTz)) {
    return withoutTz;
  }
  
  console.warn(`Invalid date format, skipping: "${dateStr}"`);
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uploadId, documentContent, fileName, documentType } = await req.json();

    if (!uploadId || !documentContent) {
      return new Response(
        JSON.stringify({ error: "uploadId and documentContent are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create analysis job (use insert instead of upsert since uploadId may not exist in evidence_uploads)
    const { data: job, error: jobError } = await supabase
      .from("document_analysis_jobs")
      .insert({
        upload_id: null, // Set to null for pasted documents without a file upload
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const jobId = job?.id;

    if (jobError) {
      console.error("Job creation error:", jobError);
    }

    const systemPrompt = `You are an expert legal analyst specializing in case investigation, evidence analysis, and timeline reconstruction. Your task is to extract structured intelligence from legal documents.

CONTEXT: This document is part of an ongoing case involving allegations of state surveillance abuse, procedural failures, and potential evidence tampering. The case involves FIA (Federal Investigation Agency) proceedings, PECA 2016 violations, and chain of custody issues.

EXTRACTION REQUIREMENTS:

1. TIMELINE EVENTS: Extract chronological events with:
   - Exact or approximate date (YYYY-MM-DD format, use best estimate if exact date unknown)
   - Category: "Business Interference", "Harassment", "Legal Proceeding", or "Criminal Allegation"
   - Description: What happened
   - Individuals: Who was involved (names and roles)
   - Legal Action: Any FIRs, court orders, warrants, or legal filings
   - Outcome: Result of the event
   - Evidence Discrepancy: Any procedural failures, contradictions, or irregularities
   - Sources: Reference to the document section

2. ENTITIES: Extract people, organizations, and official bodies with:
   - Name
   - Type: "Person", "Organization", "Official Body", or "Legal Entity"
   - Role in the case
   - Brief description

3. DISCREPANCIES: Extract evidence of procedural failures or irregularities:
   - Type: "Procedural Failure", "Chain of Custody", "Testimony Contradiction", "Document Forgery", "Timeline Inconsistency", or "Other"
   - Title: Brief name
   - Description: Detailed explanation
   - Severity: "critical", "high", "medium", or "low"
   - Legal Reference: Relevant law or regulation violated
   - Related Dates: When this occurred

Be thorough but accurate. Only extract information explicitly stated or clearly implied in the document. Assign confidence scores based on clarity of evidence.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this ${documentType || "document"} (${fileName || "uploaded file"}) and extract all timeline events, entities, and evidence discrepancies:\n\n${documentContent}` 
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_intelligence",
              description: "Extract structured intelligence from legal documents",
              parameters: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    description: "Timeline events extracted from the document",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string", description: "Date in YYYY-MM-DD format" },
                        category: { 
                          type: "string", 
                          enum: ["Business Interference", "Harassment", "Legal Proceeding", "Criminal Allegation"]
                        },
                        description: { type: "string" },
                        individuals: { type: "string" },
                        legalAction: { type: "string" },
                        outcome: { type: "string" },
                        evidenceDiscrepancy: { type: "string" },
                        sources: { type: "string" },
                        confidenceScore: { type: "number", minimum: 0, maximum: 1 }
                      },
                      required: ["date", "category", "description", "individuals", "legalAction", "outcome", "evidenceDiscrepancy", "sources", "confidenceScore"]
                    }
                  },
                  entities: {
                    type: "array",
                    description: "People, organizations, and official bodies mentioned",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        entityType: { 
                          type: "string",
                          enum: ["Person", "Organization", "Official Body", "Legal Entity"]
                        },
                        role: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["name", "entityType", "role", "description"]
                    }
                  },
                  discrepancies: {
                    type: "array",
                    description: "Evidence discrepancies and procedural failures",
                    items: {
                      type: "object",
                      properties: {
                        discrepancyType: {
                          type: "string",
                          enum: ["Procedural Failure", "Chain of Custody", "Testimony Contradiction", "Document Forgery", "Timeline Inconsistency", "Other"]
                        },
                        title: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        legalReference: { type: "string" },
                        relatedDates: { type: "array", items: { type: "string" } }
                      },
                      required: ["discrepancyType", "title", "description", "severity", "legalReference", "relatedDates"]
                    }
                  }
                },
                required: ["events", "entities", "discrepancies"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_intelligence" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        await supabase
          .from("document_analysis_jobs")
          .update({ status: "failed", error_message: "Rate limit exceeded. Please try again later." })
          .eq("upload_id", uploadId);
        
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        await supabase
          .from("document_analysis_jobs")
          .update({ status: "failed", error_message: "AI credits exhausted." })
          .eq("upload_id", uploadId);
        
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No extraction results from AI");
    }

    const extraction: ExtractionResult = JSON.parse(toolCall.function.arguments);
    console.log(`Extracted: ${extraction.events.length} events, ${extraction.entities.length} entities, ${extraction.discrepancies.length} discrepancies`);

    // Insert extracted events with validated dates (set source_upload_id to null for pasted documents)
    if (extraction.events.length > 0) {
      const eventRows = extraction.events
        .map(event => {
          const normalizedDate = normalizeDate(event.date);
          if (!normalizedDate) {
            console.warn(`Skipping event with invalid date: "${event.date}" - ${event.description.substring(0, 50)}...`);
            return null;
          }
          return {
            source_upload_id: null, // Null for pasted documents without file upload
            date: normalizedDate,
            category: event.category,
            description: event.description,
            individuals: event.individuals,
            legal_action: event.legalAction,
            outcome: event.outcome,
            evidence_discrepancy: event.evidenceDiscrepancy,
            sources: event.sources,
            confidence_score: event.confidenceScore,
            is_approved: true,
            extraction_method: "ai_analysis"
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (eventRows.length > 0) {
        const { error: eventsError } = await supabase
          .from("extracted_events")
          .insert(eventRows);

        if (eventsError) {
          console.error("Events insert error:", eventsError);
        }
      }
      
      const skipped = extraction.events.length - eventRows.length;
      if (skipped > 0) {
        console.log(`Skipped ${skipped} events due to invalid dates`);
      }
    }

    // Insert extracted entities (set source_upload_id to null for pasted documents)
    if (extraction.entities.length > 0) {
      const entityRows = extraction.entities.map(entity => ({
        source_upload_id: null, // Null for pasted documents without file upload
        name: entity.name,
        entity_type: entity.entityType,
        role: entity.role,
        description: entity.description
      }));

      const { error: entitiesError } = await supabase
        .from("extracted_entities")
        .insert(entityRows);

      if (entitiesError) {
        console.error("Entities insert error:", entitiesError);
      }
    }

    // Insert extracted discrepancies (set source_upload_id to null for pasted documents)
    if (extraction.discrepancies.length > 0) {
      const discrepancyRows = extraction.discrepancies.map(d => ({
        source_upload_id: null, // Null for pasted documents without file upload
        discrepancy_type: d.discrepancyType,
        title: d.title,
        description: d.description,
        severity: d.severity,
        legal_reference: d.legalReference,
        related_dates: d.relatedDates
      }));

      const { error: discrepanciesError } = await supabase
        .from("extracted_discrepancies")
        .insert(discrepancyRows);

      if (discrepanciesError) {
        console.error("Discrepancies insert error:", discrepanciesError);
      }
    }

    // Update job status using job ID
    if (jobId) {
      await supabase
        .from("document_analysis_jobs")
        .update({
          status: "completed",
          events_extracted: extraction.events.length,
          entities_extracted: extraction.entities.length,
          discrepancies_extracted: extraction.discrepancies.length,
          completed_at: new Date().toISOString()
        })
        .eq("id", jobId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventsExtracted: extraction.events.length,
        entitiesExtracted: extraction.entities.length,
        discrepanciesExtracted: extraction.discrepancies.length,
        events: extraction.events,
        entities: extraction.entities,
        discrepancies: extraction.discrepancies
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
