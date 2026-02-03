import { useMemo } from "react";
import { timelineData, TimelineEvent } from "@/data/timelineData";
import { useExtractedEvents, ExtractedEvent } from "./useExtractedEvents";
import {
  ReconstructedEvent,
  DelayAlert,
  ContradictionFlag,
  TimelineTrackType,
  AgencyType,
  DelayType,
  TrackStats,
  DELAY_THRESHOLDS,
} from "@/types/reconstruction";

// Helper to determine track type from category
function getTrackType(category: string): TimelineTrackType {
  switch (category) {
    case "Criminal Allegation":
      return "criminal";
    case "Business Interference":
      return "corporate";
    case "Legal Proceeding":
      return "regulatory";
    case "Harassment":
      return "personal";
    default:
      return "personal";
  }
}

// Helper to extract agency from description
function extractAgency(description: string, legalAction?: string): AgencyType {
  const text = `${description} ${legalAction || ""}`.toLowerCase();
  
  if (text.includes("fia") || text.includes("cybercrime")) return "FIA";
  if (text.includes("secp")) return "SECP";
  if (text.includes("nadra")) return "NADRA";
  if (text.includes("court") || text.includes("judge") || text.includes("magistrate") || text.includes("sessions")) return "Courts";
  if (text.includes("police") || text.includes("fir") || text.includes("boat basin")) return "Police";
  if (text.includes("military") || text.includes("col") || text.includes("major") || text.includes("lt.")) return "Military";
  
  return "Other";
}

// Extract actors from individuals string
function extractActors(individuals: string): string[] {
  if (!individuals) return [];
  return individuals.split(",").map(s => s.split("(")[0].trim()).filter(Boolean);
}

// Extract action from description
function extractAction(description: string): string {
  const verbs = ["files", "registers", "conducts", "grants", "convicts", "acquits", "issues", "terminates", "promotes", "assaults", "threatens"];
  for (const verb of verbs) {
    if (description.toLowerCase().includes(verb)) {
      const idx = description.toLowerCase().indexOf(verb);
      return description.substring(idx, Math.min(idx + 80, description.length));
    }
  }
  return description.substring(0, 80);
}

// Calculate days between dates
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// Detect delays in legal proceedings
function detectDelays(events: ReconstructedEvent[]): DelayAlert[] {
  const alerts: DelayAlert[] = [];
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find FIR to Investigation delays
  const firEvents = sortedEvents.filter(e => 
    e.description.toLowerCase().includes("fir") && 
    !e.description.toLowerCase().includes("inquiry")
  );
  const inquiryEvents = sortedEvents.filter(e => 
    e.description.toLowerCase().includes("inquiry") || 
    e.description.toLowerCase().includes("enquiry")
  );

  firEvents.forEach(fir => {
    const nextInquiry = inquiryEvents.find(inq => 
      new Date(inq.date) > new Date(fir.date)
    );
    if (nextInquiry) {
      const days = daysBetween(fir.date, nextInquiry.date);
      if (days > DELAY_THRESHOLDS.fir_to_investigation) {
        alerts.push({
          id: `delay-fir-${fir.id}`,
          type: "fir_to_investigation",
          eventId: fir.id,
          startDate: fir.date,
          endDate: nextInquiry.date,
          expectedDays: DELAY_THRESHOLDS.fir_to_investigation,
          actualDays: days,
          delayDays: days - DELAY_THRESHOLDS.fir_to_investigation,
          severity: days > 365 ? "critical" : days > 180 ? "high" : days > 90 ? "medium" : "low",
          description: `FIR filed ${fir.date} but inquiry not started until ${nextInquiry.date} (${days} days delay)`,
          legalReference: "CrPC Section 156(3)"
        });
      }
    }
  });

  // Find hearing interval delays (consecutive court events)
  const courtEvents = sortedEvents.filter(e => 
    e.agency === "Courts" || e.trackType === "regulatory"
  );
  for (let i = 0; i < courtEvents.length - 1; i++) {
    const days = daysBetween(courtEvents[i].date, courtEvents[i + 1].date);
    if (days > DELAY_THRESHOLDS.hearing_interval) {
      alerts.push({
        id: `delay-hearing-${courtEvents[i].id}`,
        type: "hearing_interval",
        eventId: courtEvents[i].id,
        startDate: courtEvents[i].date,
        endDate: courtEvents[i + 1].date,
        expectedDays: DELAY_THRESHOLDS.hearing_interval,
        actualDays: days,
        delayDays: days - DELAY_THRESHOLDS.hearing_interval,
        severity: days > 365 ? "critical" : days > 180 ? "high" : "medium",
        description: `${days} days gap between court proceedings`,
      });
    }
  }

  // Find forensic report delays
  const raidEvents = sortedEvents.filter(e => 
    e.description.toLowerCase().includes("raid") || 
    e.description.toLowerCase().includes("seiz")
  );
  const forensicEvents = sortedEvents.filter(e => 
    e.description.toLowerCase().includes("forensic")
  );

  raidEvents.forEach(raid => {
    const nextForensic = forensicEvents.find(f => 
      new Date(f.date) > new Date(raid.date)
    );
    if (nextForensic) {
      const days = daysBetween(raid.date, nextForensic.date);
      if (days > DELAY_THRESHOLDS.forensic_report) {
        alerts.push({
          id: `delay-forensic-${raid.id}`,
          type: "forensic_report",
          eventId: raid.id,
          startDate: raid.date,
          endDate: nextForensic.date,
          expectedDays: DELAY_THRESHOLDS.forensic_report,
          actualDays: days,
          delayDays: days - DELAY_THRESHOLDS.forensic_report,
          severity: days > 1000 ? "critical" : days > 365 ? "high" : "medium",
          description: `Devices seized on ${raid.date} but forensic report not submitted until ${nextForensic.date}`,
          legalReference: "PECA Section 33"
        });
      }
    }
  });

  return alerts;
}

// Detect contradictions between events
function detectContradictions(events: ReconstructedEvent[]): ContradictionFlag[] {
  const contradictions: ContradictionFlag[] = [];
  
  // Look for evidence discrepancies that mention contradictions
  events.forEach((event, idx) => {
    if (event.contradictionDetails) {
      const relatedEvent = events.find((e, i) => 
        i !== idx && 
        e.date < event.date && 
        (e.description.toLowerCase().includes(event.contradictionDetails?.toLowerCase().split(" ")[0] || "") ||
         event.contradictionDetails?.toLowerCase().includes(e.date))
      );
      
      if (relatedEvent) {
        contradictions.push({
          id: `contra-${event.id}`,
          eventId1: relatedEvent.id,
          eventId2: event.id,
          description: event.contradictionDetails,
          severity: "significant",
          type: "evidence",
          details: `Evidence from ${event.date} contradicts earlier testimony or documentation`
        });
      }
    }
  });

  // Device switching contradiction
  const deviceEvents = events.filter(e => 
    e.description.toLowerCase().includes("samsung") ||
    e.description.toLowerCase().includes("device") ||
    e.description.toLowerCase().includes("phone")
  );
  
  if (deviceEvents.length >= 2) {
    const j5Event = deviceEvents.find(e => e.description.toLowerCase().includes("j5"));
    const j7Event = deviceEvents.find(e => e.description.toLowerCase().includes("j7"));
    
    if (j5Event && j7Event) {
      contradictions.push({
        id: `contra-device-switch`,
        eventId1: j5Event.id,
        eventId2: j7Event.id,
        description: "Device model changed from Samsung J5 (in FIR) to J7 (in recovery)",
        severity: "major",
        type: "evidence",
        details: "Chain of custody violation - original device switched"
      });
    }
  }

  // Testimony contradictions (summersaulted)
  const testimonyEvents = events.filter(e => 
    e.contradictionDetails?.toLowerCase().includes("contradict") ||
    e.contradictionDetails?.toLowerCase().includes("summersault") ||
    e.contradictionDetails?.toLowerCase().includes("denied")
  );
  
  testimonyEvents.forEach(event => {
    if (!contradictions.find(c => c.eventId2 === event.id)) {
      contradictions.push({
        id: `contra-testimony-${event.id}`,
        eventId1: event.id,
        eventId2: event.id,
        description: event.contradictionDetails || "Testimony contradiction detected",
        severity: "significant",
        type: "testimony",
        details: "Witness or official testimony contradicts documented evidence"
      });
    }
  });

  return contradictions;
}

export const useReconstruction = (caseId?: string) => {
  const { data: extractedEvents, isLoading, error } = useExtractedEvents();

  const reconstructedEvents = useMemo(() => {
    // Convert static timeline data
    const staticEvents: ReconstructedEvent[] = timelineData.map((event, idx) => ({
      id: `static-${idx}`,
      date: event.date,
      description: event.description,
      actors: extractActors(event.individuals),
      action: extractAction(event.description),
      impact: event.outcome,
      category: event.category,
      trackType: getTrackType(event.category),
      agency: extractAgency(event.description, event.legalAction),
      sources: event.sources,
      isExtracted: false,
      hasContradiction: !!event.evidenceDiscrepancy && event.evidenceDiscrepancy.toLowerCase().includes("contradict"),
      contradictionDetails: event.evidenceDiscrepancy,
    }));

    // Convert extracted events (cast to access case_id which may be in the DB but not in type)
    const aiEvents: ReconstructedEvent[] = (extractedEvents || [])
      .filter(e => !caseId || (e as any).case_id === caseId)
      .map((event) => ({
        id: event.id,
        date: event.date,
        description: event.description,
        actors: extractActors(event.individuals),
        action: extractAction(event.description),
        impact: event.outcome,
        category: event.category,
        trackType: getTrackType(event.category),
        agency: extractAgency(event.description, event.legal_action),
        caseId: (event as any).case_id || undefined,
        sources: event.sources,
        isExtracted: true,
        confidenceScore: event.confidence_score || 0.85,
        hasContradiction: !!event.evidence_discrepancy && event.evidence_discrepancy.toLowerCase().includes("contradict"),
        contradictionDetails: event.evidence_discrepancy,
      }));

    // Combine and sort
    return [...staticEvents, ...aiEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [extractedEvents, caseId]);

  const delays = useMemo(() => 
    detectDelays(reconstructedEvents), 
    [reconstructedEvents]
  );

  const contradictions = useMemo(() => 
    detectContradictions(reconstructedEvents), 
    [reconstructedEvents]
  );

  const trackStats = useMemo((): TrackStats[] => {
    const tracks: TimelineTrackType[] = ["criminal", "regulatory", "corporate", "personal"];
    
    return tracks.map(trackType => {
      const trackEvents = reconstructedEvents.filter(e => e.trackType === trackType);
      const dates = trackEvents.map(e => e.date).sort();
      
      return {
        trackType,
        eventCount: trackEvents.length,
        delayCount: delays.filter(d => 
          trackEvents.some(e => e.id === d.eventId)
        ).length,
        contradictionCount: contradictions.filter(c => 
          trackEvents.some(e => e.id === c.eventId1 || e.id === c.eventId2)
        ).length,
        dateRange: {
          start: dates[0] || "",
          end: dates[dates.length - 1] || "",
        }
      };
    });
  }, [reconstructedEvents, delays, contradictions]);

  const eventsByTrack = useMemo(() => {
    const result: Record<TimelineTrackType, ReconstructedEvent[]> = {
      criminal: [],
      regulatory: [],
      corporate: [],
      personal: [],
    };
    
    reconstructedEvents.forEach(event => {
      result[event.trackType].push(event);
    });
    
    return result;
  }, [reconstructedEvents]);

  const eventsByAgency = useMemo(() => {
    const result: Record<AgencyType, ReconstructedEvent[]> = {
      FIA: [],
      SECP: [],
      NADRA: [],
      Courts: [],
      Police: [],
      Military: [],
      Other: [],
    };
    
    reconstructedEvents.forEach(event => {
      if (event.agency) {
        result[event.agency].push(event);
      }
    });
    
    return result;
  }, [reconstructedEvents]);

  return {
    events: reconstructedEvents,
    eventsByTrack,
    eventsByAgency,
    delays,
    contradictions,
    trackStats,
    isLoading,
    error,
  };
};
