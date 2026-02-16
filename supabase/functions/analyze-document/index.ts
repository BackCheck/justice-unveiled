import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

interface ExtractedClaim {
  allegationText: string;
  claimType: "criminal" | "regulatory" | "civil";
  legalFramework: "pakistani" | "international";
  legalSection: string;
  allegedBy: string;
  allegedAgainst: string;
  dateAlleged: string;
  sourceDocument: string;
}

interface ComplianceViolation {
  violationType: "Procedural Failure" | "Documentation Gap" | "Chain of Custody" | "Constitutional Violation" | "Due Process Violation";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  legalConsequence: string;
  remediationPossible: boolean;
}

interface FinancialHarmIncident {
  incidentType: "account_freeze" | "license_revocation" | "regulatory_notice" | "contract_termination" | "asset_seizure" | "other";
  title: string;
  description: string;
  date: string;
  estimatedLoss: number;
  currency: string;
  lossCategory: "direct_financial" | "lost_income" | "legal_costs" | "opportunity_cost" | "reputational" | "time_cost";
  perpetratorAgency: string;
  isDocumented: boolean;
}

interface ExtractionResult {
  events: ExtractedEvent[];
  entities: ExtractedEntity[];
  discrepancies: ExtractedDiscrepancy[];
  claims: ExtractedClaim[];
  complianceViolations: ComplianceViolation[];
  financialHarm: FinancialHarmIncident[];
}

// Validate and normalize date to YYYY-MM-DD format
function normalizeDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const cleaned = dateStr.trim().replace(/\.$/, '');
  
  const validFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (validFormat.test(cleaned)) {
    const [year, month, day] = cleaned.split('-').map(Number);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      return cleaned;
    }
  }
  
  const dateMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${year}-${month}-${day}`;
    }
  }
  
  const rangeMatch = cleaned.match(/^(\d{4}-\d{2}-\d{2})-\d{4}-\d{2}-\d{2}$/);
  if (rangeMatch) {
    return rangeMatch[1];
  }
  
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
    const { uploadId, documentContent, fileName, documentType, caseId, storagePath } = await req.json();

    if (!uploadId) {
      return new Response(
        JSON.stringify({ error: "uploadId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing document for case: ${caseId || 'no case specified'}, file: ${fileName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify uploadId exists in evidence_uploads before using as FK
    let validSourceUploadId: string | null = null;
    if (uploadId && uploadId !== 'pasted') {
      const { data: existingUpload } = await supabase
        .from("evidence_uploads")
        .select("id")
        .eq("id", uploadId)
        .maybeSingle();
      
      if (existingUpload) {
        validSourceUploadId = uploadId;
      } else {
        console.warn(`Upload ID ${uploadId} not found in evidence_uploads, proceeding without FK link`);
      }
    }

    // Create analysis job
    const { data: job, error: jobError } = await supabase
      .from("document_analysis_jobs")
      .insert({
        upload_id: validSourceUploadId,
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const jobId = job?.id;
    if (jobError) {
      console.error("Job creation error:", jobError);
    }

    // Determine if we need to fetch the file from storage
    let actualContent = documentContent || '';
    let fileBase64: string | null = null;
    let fileMimeType: string | null = null;
    const isPdf = fileName?.toLowerCase().endsWith('.pdf');
    const isImage = /\.(png|jpg|jpeg|gif|webp|bmp|tiff)$/i.test(fileName || '');
    const isText = /\.(txt|md|csv|json|log)$/i.test(fileName || '');
    const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName || '');
    const needsBinaryFetch = (isPdf || isImage) && storagePath;
    const needsTextFetch = isText && storagePath && !actualContent;
    const needsAudioFetch = isAudio && storagePath;

    if (needsBinaryFetch) {
      console.log(`Fetching binary file from storage: ${storagePath}`);
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('evidence')
          .download(storagePath);
        
        if (downloadError) {
          console.error('Storage download error:', downloadError);
        } else if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode(...chunk);
          }
          fileBase64 = btoa(binary);
          fileMimeType = isPdf ? 'application/pdf' : 'image/png';
          console.log(`Successfully fetched file, base64 length: ${fileBase64.length}`);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch file from storage:', fetchErr);
      }
    } else if (needsTextFetch) {
      console.log(`Fetching text file from storage: ${storagePath}`);
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('evidence')
          .download(storagePath);
        
        if (downloadError) {
          console.error('Storage download error:', downloadError);
        } else if (fileData) {
          actualContent = await fileData.text();
          console.log(`Successfully fetched text file, content length: ${actualContent.length}`);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch text file from storage:', fetchErr);
      }
    } else if (needsAudioFetch) {
      console.log(`Fetching audio file from storage for multimodal analysis: ${storagePath}`);
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('evidence')
          .download(storagePath);
        
        if (downloadError) {
          console.error('Storage download error:', downloadError);
        } else if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode(...chunk);
          }
          fileBase64 = btoa(binary);
          const ext = (fileName || '').split('.').pop()?.toLowerCase();
          const mimeMap: Record<string, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', flac: 'audio/flac' };
          fileMimeType = mimeMap[ext || ''] || 'audio/mpeg';
          console.log(`Successfully fetched audio file, base64 length: ${fileBase64.length}`);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch audio file from storage:', fetchErr);
      }
    }

    // If we couldn't get any content, skip
    if (!fileBase64 && (!actualContent || actualContent.startsWith('[PDF Document:') || actualContent.startsWith('[Video File:') || actualContent.startsWith('[Audio File:'))) {
      console.log('No extractable content available for analysis');
      if (jobId) {
        await supabase.from("document_analysis_jobs").update({
          status: "completed",
          events_extracted: 0,
          entities_extracted: 0,
          discrepancies_extracted: 0,
          completed_at: new Date().toISOString()
        }).eq("id", jobId);
      }
      return new Response(
        JSON.stringify({
          success: true,
          eventsExtracted: 0, entitiesExtracted: 0, discrepanciesExtracted: 0,
          claimsExtracted: 0, complianceViolationsExtracted: 0, financialHarmExtracted: 0,
          events: [], entities: [], discrepancies: [], claims: [], complianceViolations: [], financialHarm: [],
          note: 'No extractable text content. Server-side binary extraction was attempted.'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert legal analyst specializing in case investigation, evidence analysis, human rights documentation, and financial harm assessment. Your task is to extract comprehensive structured intelligence from legal documents.

CONTEXT: This document is part of an ongoing investigation involving potential procedural failures, human rights violations, financial harm, and evidence of selective enforcement. The case involves FIA (Federal Investigation Agency) proceedings, PECA 2016, regulatory actions, and chain of custody issues.

EXTRACTION REQUIREMENTS:

1. TIMELINE EVENTS: Extract chronological events with:
   - Exact or approximate date (YYYY-MM-DD format)
   - Category: "Business Interference", "Harassment", "Legal Proceeding", or "Criminal Allegation"
   - Description, Individuals involved, Legal Action, Outcome
   - Evidence Discrepancy: Any procedural failures or irregularities
   - Sources: Reference to document section

2. ENTITIES: Extract people, organizations, and official bodies with:
   - Name, Type, Role, Description

3. DISCREPANCIES: Extract evidence of procedural failures:
   - Type, Title, Description, Severity, Legal Reference, Related Dates

4. LEGAL CLAIMS: Extract allegations/charges made in the document:
   - Allegation text (verbatim or summarized)
   - Claim type: "criminal", "regulatory", or "civil"
   - Legal framework: "pakistani" or "international"
   - Legal section (e.g., "PECA 2016 Section 20", "PPC Section 409")
   - Who made the allegation (alleged_by)
   - Who is accused (alleged_against)
   - Date of allegation
   - Source document reference

5. COMPLIANCE VIOLATIONS: Identify procedural/constitutional violations:
   - Violation type: "Procedural Failure", "Documentation Gap", "Chain of Custody", "Constitutional Violation", "Due Process Violation"
   - Title, Description, Severity
   - Legal consequence (case impact)
   - Whether remediation is possible

6. FINANCIAL/ECONOMIC HARM: Extract evidence of financial damage:
   - Incident type: "account_freeze", "license_revocation", "regulatory_notice", "contract_termination", "asset_seizure", "other"
   - Title, Description, Date
   - Estimated loss amount (in numbers, best estimate)
   - Currency (PKR, USD, etc.)
   - Loss category: "direct_financial", "lost_income", "legal_costs", "opportunity_cost", "reputational", "time_cost"
   - Perpetrator agency (who caused the harm)
   - Whether documented with evidence

Be thorough but accurate. Only extract information explicitly stated or clearly implied. Assign confidence scores based on clarity of evidence.`;

    // Build the user message parts - use multimodal if we have base64
    let userMessageParts: any[];
    if (fileBase64) {
      // Use Gemini multimodal: send the actual file as inline_data
      userMessageParts = [
        {
          type: "text",
          text: `Analyze this ${documentType || "document"} (${fileName || "uploaded file"}) and extract ALL intelligence including timeline events, entities, discrepancies, LEGAL CLAIMS, COMPLIANCE VIOLATIONS, and FINANCIAL HARM.`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${fileMimeType};base64,${fileBase64}`
          }
        }
      ];
      console.log('Using multimodal analysis with binary file content');
    } else {
      // Use text content directly
      const MAX_CONTENT_CHARS = 500000;
      let truncatedContent = actualContent;
      let truncationNote = '';
      if (actualContent.length > MAX_CONTENT_CHARS) {
        truncatedContent = actualContent.substring(0, MAX_CONTENT_CHARS);
        truncationNote = `\n\n[NOTE: Document was truncated from ${actualContent.length} to ${MAX_CONTENT_CHARS} characters due to size limits. Analysis covers the first portion only.]`;
        console.log(`Document truncated from ${actualContent.length} to ${MAX_CONTENT_CHARS} chars`);
      }
      userMessageParts = [
        {
          type: "text", 
          text: `Analyze this ${documentType || "document"} (${fileName || "uploaded file"}) and extract ALL intelligence including timeline events, entities, discrepancies, LEGAL CLAIMS, COMPLIANCE VIOLATIONS, and FINANCIAL HARM:\n\n${truncatedContent}${truncationNote}`
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: userMessageParts
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_intelligence",
              description: "Extract comprehensive structured intelligence from legal documents including claims, compliance issues, and financial harm",
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
                  },
                  claims: {
                    type: "array",
                    description: "Legal claims and allegations extracted from the document",
                    items: {
                      type: "object",
                      properties: {
                        allegationText: { type: "string", description: "The allegation text" },
                        claimType: { type: "string", enum: ["criminal", "regulatory", "civil"] },
                        legalFramework: { type: "string", enum: ["pakistani", "international"] },
                        legalSection: { type: "string", description: "e.g. PECA 2016 Section 20" },
                        allegedBy: { type: "string" },
                        allegedAgainst: { type: "string" },
                        dateAlleged: { type: "string", description: "Date in YYYY-MM-DD format" },
                        sourceDocument: { type: "string" }
                      },
                      required: ["allegationText", "claimType", "legalFramework", "legalSection", "allegedBy", "allegedAgainst", "dateAlleged", "sourceDocument"]
                    }
                  },
                  complianceViolations: {
                    type: "array",
                    description: "Procedural and constitutional violations identified",
                    items: {
                      type: "object",
                      properties: {
                        violationType: { type: "string", enum: ["Procedural Failure", "Documentation Gap", "Chain of Custody", "Constitutional Violation", "Due Process Violation"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        legalConsequence: { type: "string" },
                        remediationPossible: { type: "boolean" }
                      },
                      required: ["violationType", "title", "description", "severity", "legalConsequence", "remediationPossible"]
                    }
                  },
                  financialHarm: {
                    type: "array",
                    description: "Financial and economic harm incidents",
                    items: {
                      type: "object",
                      properties: {
                        incidentType: { type: "string", enum: ["account_freeze", "license_revocation", "regulatory_notice", "contract_termination", "asset_seizure", "other"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        date: { type: "string", description: "Date in YYYY-MM-DD format" },
                        estimatedLoss: { type: "number", description: "Estimated financial loss" },
                        currency: { type: "string", description: "Currency code (PKR, USD, etc.)" },
                        lossCategory: { type: "string", enum: ["direct_financial", "lost_income", "legal_costs", "opportunity_cost", "reputational", "time_cost"] },
                        perpetratorAgency: { type: "string" },
                        isDocumented: { type: "boolean" }
                      },
                      required: ["incidentType", "title", "description", "date", "estimatedLoss", "currency", "lossCategory", "perpetratorAgency", "isDocumented"]
                    }
                  }
                },
                required: ["events", "entities", "discrepancies", "claims", "complianceViolations", "financialHarm"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_intelligence" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        if (jobId) {
          await supabase.from("document_analysis_jobs").update({ status: "failed", error_message: "Rate limit exceeded." }).eq("id", jobId);
        }
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        if (jobId) {
          await supabase.from("document_analysis_jobs").update({ status: "failed", error_message: "AI credits exhausted." }).eq("id", jobId);
        }
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
    console.log(`Extracted: ${extraction.events?.length || 0} events, ${extraction.entities?.length || 0} entities, ${extraction.discrepancies?.length || 0} discrepancies, ${extraction.claims?.length || 0} claims, ${extraction.complianceViolations?.length || 0} compliance violations, ${extraction.financialHarm?.length || 0} financial harm incidents`);

    const sourceUploadId = validSourceUploadId;

    // Insert extracted events
    if (extraction.events?.length > 0) {
      const eventRows = extraction.events
        .map(event => {
          const normalizedDate = normalizeDate(event.date);
          if (!normalizedDate) {
            console.warn(`Skipping event with invalid date: "${event.date}"`);
            return null;
          }
          return {
            source_upload_id: sourceUploadId,
            case_id: caseId || null,
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
        const { error: eventsError } = await supabase.from("extracted_events").insert(eventRows);
        if (eventsError) console.error("Events insert error:", eventsError);
      }
    }

    // Insert extracted entities
    if (extraction.entities?.length > 0) {
      const entityRows = extraction.entities.map(entity => ({
        source_upload_id: sourceUploadId,
        case_id: caseId || null,
        name: entity.name,
        entity_type: entity.entityType,
        role: entity.role,
        description: entity.description
      }));
      const { error: entitiesError } = await supabase.from("extracted_entities").insert(entityRows);
      if (entitiesError) console.error("Entities insert error:", entitiesError);
    }

    // Insert extracted discrepancies
    if (extraction.discrepancies?.length > 0) {
      const discrepancyRows = extraction.discrepancies.map(d => ({
        source_upload_id: sourceUploadId,
        case_id: caseId || null,
        discrepancy_type: d.discrepancyType,
        title: d.title,
        description: d.description,
        severity: d.severity,
        legal_reference: d.legalReference,
        related_dates: d.relatedDates
      }));
      const { error: discrepanciesError } = await supabase.from("extracted_discrepancies").insert(discrepancyRows);
      if (discrepanciesError) console.error("Discrepancies insert error:", discrepanciesError);
    }

    // Insert extracted claims (for Claim Correlation)
    if (extraction.claims?.length > 0) {
      const claimRows = extraction.claims.map(claim => {
        const normalizedDate = normalizeDate(claim.dateAlleged);
        return {
          case_id: caseId || null,
          source_upload_id: sourceUploadId,
          allegation_text: claim.allegationText,
          claim_type: claim.claimType,
          legal_framework: claim.legalFramework,
          legal_section: claim.legalSection,
          alleged_by: claim.allegedBy,
          alleged_against: claim.allegedAgainst,
          date_alleged: normalizedDate,
          source_document: claim.sourceDocument,
          status: 'unverified'
        };
      });
      const { error: claimsError } = await supabase.from("legal_claims").insert(claimRows);
      if (claimsError) console.error("Claims insert error:", claimsError);
      else console.log(`Inserted ${claimRows.length} legal claims`);
    }

    // Insert compliance violations
    if (extraction.complianceViolations?.length > 0) {
      const violationRows = extraction.complianceViolations.map(v => ({
        case_id: caseId || null,
        title: v.title,
        description: v.description,
        violation_type: v.violationType,
        severity: v.severity,
        legal_consequence: v.legalConsequence,
        remediation_possible: v.remediationPossible,
        resolved: false
      }));
      const { error: violationsError } = await supabase.from("compliance_violations").insert(violationRows);
      if (violationsError) console.error("Compliance violations insert error:", violationsError);
      else console.log(`Inserted ${violationRows.length} compliance violations`);
    }

    // Insert financial harm incidents (for Economic Harm)
    if (extraction.financialHarm?.length > 0) {
      const incidentRows = extraction.financialHarm.map(harm => {
        const normalizedDate = normalizeDate(harm.date);
        return {
          case_id: caseId || null,
          incident_type: harm.incidentType,
          title: harm.title,
          description: harm.description,
          incident_date: normalizedDate,
          institution_name: harm.perpetratorAgency || null,
          status: 'documented'
        };
      });
      
      // Insert incidents first
      const { data: insertedIncidents, error: incidentsError } = await supabase
        .from("regulatory_harm_incidents")
        .insert(incidentRows)
        .select();
      
      if (incidentsError) {
        console.error("Financial harm incidents insert error:", incidentsError);
      } else if (insertedIncidents && insertedIncidents.length > 0) {
        console.log(`Inserted ${insertedIncidents.length} financial harm incidents`);
        
        // Insert associated financial losses
        const lossRows = extraction.financialHarm.map((harm, index) => ({
          case_id: caseId || null,
          incident_id: insertedIncidents[index]?.id,
          amount: harm.estimatedLoss || 0,
          currency: harm.currency || 'PKR',
          loss_category: harm.lossCategory,
          description: harm.description,
          is_estimated: true,
          is_documented: harm.isDocumented || false
        })).filter(row => row.incident_id);

        if (lossRows.length > 0) {
          const { error: lossesError } = await supabase.from("financial_losses").insert(lossRows);
          if (lossesError) console.error("Financial losses insert error:", lossesError);
          else console.log(`Inserted ${lossRows.length} financial loss records`);
        }
      }
    }

    // Update job status
    if (jobId) {
      await supabase
        .from("document_analysis_jobs")
        .update({
          status: "completed",
          events_extracted: extraction.events?.length || 0,
          entities_extracted: extraction.entities?.length || 0,
          discrepancies_extracted: extraction.discrepancies?.length || 0,
          completed_at: new Date().toISOString()
        })
        .eq("id", jobId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventsExtracted: extraction.events?.length || 0,
        entitiesExtracted: extraction.entities?.length || 0,
        discrepanciesExtracted: extraction.discrepancies?.length || 0,
        claimsExtracted: extraction.claims?.length || 0,
        complianceViolationsExtracted: extraction.complianceViolations?.length || 0,
        financialHarmExtracted: extraction.financialHarm?.length || 0,
        events: extraction.events || [],
        entities: extraction.entities || [],
        discrepancies: extraction.discrepancies || [],
        claims: extraction.claims || [],
        complianceViolations: extraction.complianceViolations || [],
        financialHarm: extraction.financialHarm || []
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
