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

    // Create or update analysis job
    const { data: job, error: jobError } = await supabase
      .from("document_analysis_jobs")
      .upsert({
        upload_id: uploadId,
        status: "processing",
        started_at: new Date().toISOString(),
      }, { onConflict: "upload_id" })
      .select()
      .single();

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

    // Insert extracted events
    if (extraction.events.length > 0) {
      const eventRows = extraction.events.map(event => ({
        source_upload_id: uploadId,
        date: event.date,
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
      }));

      const { error: eventsError } = await supabase
        .from("extracted_events")
        .insert(eventRows);

      if (eventsError) {
        console.error("Events insert error:", eventsError);
      }
    }

    // Insert extracted entities
    if (extraction.entities.length > 0) {
      const entityRows = extraction.entities.map(entity => ({
        source_upload_id: uploadId,
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

    // Insert extracted discrepancies
    if (extraction.discrepancies.length > 0) {
      const discrepancyRows = extraction.discrepancies.map(d => ({
        source_upload_id: uploadId,
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

    // Update job status
    await supabase
      .from("document_analysis_jobs")
      .update({
        status: "completed",
        events_extracted: extraction.events.length,
        entities_extracted: extraction.entities.length,
        discrepancies_extracted: extraction.discrepancies.length,
        completed_at: new Date().toISOString()
      })
      .eq("upload_id", uploadId);

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
