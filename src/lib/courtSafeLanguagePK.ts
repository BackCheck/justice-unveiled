/**
 * Court-Safe Language Library for Pakistan High Courts.
 * Deterministic phrase sets for court filings.
 */

export type CourtStyle = "IHC" | "SHC" | "LHC" | "PHC" | "BHC" | "AJKHC" | "GBCC" | "SC";
export type FilingType = "writ" | "criminal_misc" | "appeal" | "representation";

type PhraseKey =
  | "submission_open"
  | "it_is_respectfully_submitted"
  | "prima_facie"
  | "allegation_softener"
  | "subject_to_proof"
  | "without_prejudice"
  | "no_judicial_determination"
  | "data_limitations"
  | "relief_prayed"
  | "verification";

const DEFAULT_PHRASES: Record<PhraseKey, string[]> = {
  submission_open: [
    "May it please this Honourable Court,",
    "It is humbly submitted before this Honourable Court that,",
  ],
  it_is_respectfully_submitted: [
    "It is respectfully submitted that",
    "It is humbly submitted that",
    "The petitioner respectfully submits that",
  ],
  prima_facie: [
    "prima facie",
    "on the face of the record",
    "as appears from the available material",
  ],
  allegation_softener: [
    "it is alleged that",
    "it appears that",
    "it is submitted that",
    "according to the available record",
    "as per the petitioner's case",
  ],
  subject_to_proof: [
    "subject to proof and verification",
    "subject to further evidence",
    "as may be established during trial",
  ],
  without_prejudice: [
    "without prejudice to the rights of the parties",
    "without prejudice to any rights or claims",
  ],
  no_judicial_determination: [
    "This submission does not constitute a judicial determination of any fact alleged herein.",
    "The facts stated herein are based on the petitioner's instructions and available documentary evidence, and remain subject to judicial scrutiny.",
  ],
  data_limitations: [
    "The data presented herein is derived from case records and analytical tools. Independent verification is recommended.",
    "Findings are analytical in nature and should not be treated as conclusive evidence without independent verification.",
  ],
  relief_prayed: [
    "In view of the foregoing, it is most respectfully prayed that this Honourable Court may be pleased to:",
    "The petitioner therefore humbly prays that this Honourable Court may graciously:",
  ],
  verification: [
    "I solemnly affirm and declare that the contents of this submission are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.",
  ],
};

// Court-specific overrides
const COURT_OVERRIDES: Partial<Record<CourtStyle, Partial<Record<FilingType, Partial<Record<PhraseKey, string[]>>>>>> = {
  SC: {
    writ: {
      submission_open: [
        "May it please this Honourable Supreme Court of Pakistan,",
      ],
      relief_prayed: [
        "In light of the above submissions, it is most humbly prayed that this Honourable Supreme Court may be pleased to:",
      ],
    },
    appeal: {
      submission_open: [
        "May it please this Honourable Supreme Court of Pakistan,",
        "Before this Apex Court, it is respectfully submitted that,",
      ],
    },
  },
  IHC: {
    writ: {
      submission_open: [
        "May it please this Honourable Islamabad High Court,",
      ],
    },
  },
  SHC: {
    writ: {
      submission_open: [
        "May it please this Honourable Sindh High Court,",
      ],
    },
  },
  LHC: {
    writ: {
      submission_open: [
        "May it please this Honourable Lahore High Court,",
      ],
    },
  },
  PHC: {
    writ: {
      submission_open: [
        "May it please this Honourable Peshawar High Court,",
      ],
    },
  },
  BHC: {
    writ: {
      submission_open: [
        "May it please this Honourable Balochistan High Court,",
      ],
    },
  },
};

/**
 * courtSafeLibrary — full phrase sets per court × filing type.
 */
export const courtSafeLibrary: Record<CourtStyle, Record<FilingType, Record<PhraseKey, string[]>>> = (() => {
  const courts: CourtStyle[] = ["IHC", "SHC", "LHC", "PHC", "BHC", "AJKHC", "GBCC", "SC"];
  const filings: FilingType[] = ["writ", "criminal_misc", "appeal", "representation"];
  const lib = {} as any;

  for (const court of courts) {
    lib[court] = {} as any;
    for (const filing of filings) {
      const phrases = { ...DEFAULT_PHRASES };
      const overrides = COURT_OVERRIDES[court]?.[filing];
      if (overrides) {
        for (const [key, val] of Object.entries(overrides)) {
          (phrases as any)[key] = val;
        }
      }
      lib[court][filing] = phrases;
    }
  }
  return lib;
})();

/**
 * Flatten court-safe phrases into a simple dictionary with first phrase as default.
 */
export function getCourtSafePhrases(courtStyle: CourtStyle, filingType: FilingType): Record<PhraseKey, string> {
  const phrases = courtSafeLibrary[courtStyle]?.[filingType] || courtSafeLibrary["IHC"]["writ"];
  const result = {} as Record<PhraseKey, string>;
  for (const [key, values] of Object.entries(phrases)) {
    result[key as PhraseKey] = values[0] || "";
  }
  return result;
}
