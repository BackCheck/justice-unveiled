import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HRPM_IDENTITY_ID = "identity--hrpm-org-00000000-0000-0000-0000-000000000001";
const STIX_SPEC = "2.1";

function stixId(type: string, uuid: string): string {
  return `${type}--${uuid}`;
}

function toISODate(d: string | null): string {
  if (!d) return new Date().toISOString();
  try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
}

// Map HRPM entity_type/category to STIX SDO type
function mapEntityToStix(entity: any): any[] {
  const objects: any[] = [];
  const category = (entity.category || "").toLowerCase();
  const entityType = (entity.entity_type || "").toLowerCase();

  // Antagonists → threat-actor; others → identity
  if (category === "antagonist") {
    objects.push({
      type: "threat-actor",
      spec_version: STIX_SPEC,
      id: stixId("threat-actor", entity.id),
      created: toISODate(entity.created_at),
      modified: toISODate(entity.created_at),
      name: entity.name,
      description: entity.description || "",
      threat_actor_types: entityType === "person" ? ["crime-syndicate"] : ["nation-state"],
      aliases: Array.isArray(entity.aliases) ? entity.aliases.map((a: any) => typeof a === "string" ? a : a.alias || a.value || "") : [],
      roles: entity.role_tags || [],
      first_seen: toISODate(entity.first_seen_date),
      last_seen: toISODate(entity.last_seen_date),
      sophistication: "expert",
      resource_level: "government",
      primary_motivation: "dominance",
      created_by_ref: HRPM_IDENTITY_ID,
      object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"], // TLP:WHITE
      x_hrpm_influence_score: entity.influence_score,
      x_hrpm_position_title: entity.position_title,
      x_hrpm_organization: entity.organization_affiliation,
    });
  } else {
    const identityClass = entityType === "person" ? "individual" : entityType === "organization" ? "organization" : "class";
    objects.push({
      type: "identity",
      spec_version: STIX_SPEC,
      id: stixId("identity", entity.id),
      created: toISODate(entity.created_at),
      modified: toISODate(entity.created_at),
      name: entity.name,
      description: entity.description || "",
      identity_class: identityClass,
      sectors: entity.organization_affiliation ? [entity.organization_affiliation] : [],
      created_by_ref: HRPM_IDENTITY_ID,
      object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
      x_hrpm_role: entity.role,
      x_hrpm_category: entity.category,
      x_hrpm_influence_score: entity.influence_score,
    });
  }

  return objects;
}

function mapEventToStix(event: any): any {
  return {
    type: "incident",
    spec_version: STIX_SPEC,
    id: stixId("incident", event.id),
    created: toISODate(event.created_at),
    modified: toISODate(event.updated_at),
    name: `[${event.category}] ${event.date}`,
    description: event.description,
    created_by_ref: HRPM_IDENTITY_ID,
    object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
    x_hrpm_category: event.category,
    x_hrpm_date: event.date,
    x_hrpm_individuals: event.individuals,
    x_hrpm_legal_action: event.legal_action,
    x_hrpm_outcome: event.outcome,
    x_hrpm_evidence_discrepancy: event.evidence_discrepancy,
    x_hrpm_sources: event.sources,
    x_hrpm_confidence_score: event.confidence_score,
  };
}

function mapCaseToStix(caseData: any, objectRefs: string[]): any {
  return {
    type: "report",
    spec_version: STIX_SPEC,
    id: stixId("report", caseData.id),
    created: toISODate(caseData.created_at),
    modified: toISODate(caseData.updated_at),
    name: caseData.title,
    description: caseData.description || "",
    report_types: ["threat-report"],
    published: toISODate(caseData.date_opened),
    created_by_ref: HRPM_IDENTITY_ID,
    object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
    object_refs: objectRefs,
    x_hrpm_case_number: caseData.case_number,
    x_hrpm_status: caseData.status,
    x_hrpm_severity: caseData.severity,
    x_hrpm_category: caseData.category,
    x_hrpm_location: caseData.location,
  };
}

function mapRelationshipToStix(rel: any, entityMap: Map<string, string>): any | null {
  const sourceRef = entityMap.get(rel.source_entity_id);
  const targetRef = entityMap.get(rel.target_entity_id);
  if (!sourceRef || !targetRef) return null;

  // Map relationship types to STIX
  const typeMap: Record<string, string> = {
    "commands": "controls",
    "controls": "controls",
    "associates_with": "related-to",
    "finances": "related-to",
    "reports_to": "related-to",
    "threatens": "targets",
    "targets": "targets",
    "employs": "related-to",
    "family": "related-to",
    "legal_action": "related-to",
  };

  return {
    type: "relationship",
    spec_version: STIX_SPEC,
    id: stixId("relationship", rel.id),
    created: toISODate(rel.created_at),
    modified: toISODate(rel.updated_at),
    relationship_type: typeMap[rel.relationship_type] || "related-to",
    description: rel.description || `${rel.relationship_type} relationship`,
    source_ref: sourceRef,
    target_ref: targetRef,
    created_by_ref: HRPM_IDENTITY_ID,
    object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
    x_hrpm_relationship_type: rel.relationship_type,
    x_hrpm_influence_weight: rel.influence_weight,
    x_hrpm_is_verified: rel.is_verified,
  };
}

function mapViolationToStix(v: any): any {
  return {
    type: "note",
    spec_version: STIX_SPEC,
    id: stixId("note", v.id),
    created: toISODate(v.flagged_at),
    modified: toISODate(v.flagged_at),
    abstract: v.title,
    content: `**${v.violation_type}** (${v.severity})\n\n${v.description}\n\nLegal Consequence: ${v.legal_consequence || "N/A"}`,
    created_by_ref: HRPM_IDENTITY_ID,
    object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
    x_hrpm_severity: v.severity,
    x_hrpm_violation_type: v.violation_type,
    x_hrpm_resolved: v.resolved,
  };
}

function mapDiscrepancyToStix(d: any): any {
  return {
    type: "note",
    spec_version: STIX_SPEC,
    id: stixId("note", d.id),
    created: toISODate(d.created_at),
    modified: toISODate(d.created_at),
    abstract: `[Discrepancy] ${d.title}`,
    content: `**${d.discrepancy_type}** (${d.severity})\n\n${d.description}\n\nLegal Reference: ${d.legal_reference || "N/A"}`,
    created_by_ref: HRPM_IDENTITY_ID,
    object_marking_refs: ["marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9"],
    x_hrpm_discrepancy_type: d.discrepancy_type,
    x_hrpm_severity: d.severity,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Only GET requests supported" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const caseId = url.searchParams.get("case_id");
  const includeParam = url.searchParams.get("include") || "all";
  const includes = new Set(includeParam.split(",").map(s => s.trim()));
  const wantAll = includes.has("all");

  try {
    const stixObjects: any[] = [];

    // HRPM organization identity (always included)
    stixObjects.push({
      type: "identity",
      spec_version: STIX_SPEC,
      id: HRPM_IDENTITY_ID,
      created: "2024-01-01T00:00:00.000Z",
      modified: new Date().toISOString(),
      name: "HRPM — Human Rights Pattern Monitor",
      description: "Open-source investigative intelligence platform for documenting human rights violations.",
      identity_class: "organization",
      sectors: ["government-national", "non-profit"],
      contact_information: "https://hrpm.lovable.app",
    });

    // TLP:WHITE marking definition
    stixObjects.push({
      type: "marking-definition",
      spec_version: STIX_SPEC,
      id: "marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9",
      created: "2017-01-20T00:00:00.000Z",
      definition_type: "tlp",
      name: "TLP:WHITE",
      definition: { tlp: "white" },
    });

    // Entity ID → STIX ID map for relationships
    const entityMap = new Map<string, string>();

    // ── Entities ──
    if (wantAll || includes.has("entities") || includes.has("threat-actors")) {
      let query = supabase.from("extracted_entities").select("*");
      if (caseId) query = query.eq("case_id", caseId);
      const { data: entities } = await query;
      if (entities) {
        for (const e of entities) {
          const mapped = mapEntityToStix(e);
          for (const obj of mapped) {
            stixObjects.push(obj);
            entityMap.set(e.id, obj.id);
          }
        }
      }
    }

    // ── Events ──
    if (wantAll || includes.has("events") || includes.has("incidents")) {
      let query = supabase.from("extracted_events").select("*").eq("is_hidden", false);
      if (caseId) query = query.eq("case_id", caseId);
      const { data: events } = await query;
      if (events) {
        for (const ev of events) {
          stixObjects.push(mapEventToStix(ev));
        }
      }
    }

    // ── Relationships ──
    if (wantAll || includes.has("relationships")) {
      let query = supabase.from("entity_relationships").select("*");
      if (caseId) query = query.eq("case_id", caseId);
      const { data: rels } = await query;
      if (rels) {
        for (const r of rels) {
          const mapped = mapRelationshipToStix(r, entityMap);
          if (mapped) stixObjects.push(mapped);
        }
      }
    }

    // ── Violations ──
    if (wantAll || includes.has("violations")) {
      let query = supabase.from("compliance_violations").select("*");
      if (caseId) query = query.eq("case_id", caseId);
      const { data: violations } = await query;
      if (violations) {
        for (const v of violations) {
          stixObjects.push(mapViolationToStix(v));
        }
      }
    }

    // ── Discrepancies ──
    if (wantAll || includes.has("discrepancies")) {
      let query = supabase.from("extracted_discrepancies").select("*");
      if (caseId) query = query.eq("case_id", caseId);
      const { data: discs } = await query;
      if (discs) {
        for (const d of discs) {
          stixObjects.push(mapDiscrepancyToStix(d));
        }
      }
    }

    // ── Cases as Reports ──
    if (wantAll || includes.has("cases") || includes.has("reports")) {
      let query = supabase.from("cases").select("*");
      if (caseId) query = query.eq("id", caseId);
      const { data: cases } = await query;
      if (cases) {
        // Gather all object refs that belong to each case
        for (const c of cases) {
          const refs = stixObjects
            .filter((o: any) => o.id !== HRPM_IDENTITY_ID && o.type !== "marking-definition")
            .map((o: any) => o.id);
          stixObjects.push(mapCaseToStix(c, caseId ? refs : []));
        }
      }
    }

    const bundle = {
      type: "bundle",
      id: `bundle--${crypto.randomUUID()}`,
      objects: stixObjects,
    };

    return new Response(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/stix+json;version=2.1",
        "X-STIX-Objects-Count": String(stixObjects.length),
      },
    });
  } catch (err) {
    console.error("STIX2 export error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
