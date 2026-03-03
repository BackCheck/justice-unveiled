/**
 * Name normalization utility for canonical entity matching.
 * Strips titles, punctuation, and collapses whitespace for deterministic dedup.
 */

const TITLE_PATTERNS = [
  /\b(?:Major|Maj)\.?\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Colonel|Col)\.?\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Lt\.?\s*Col\.?|Lieutenant\s*Colonel)\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Brigadier|Brig)\.?\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:General|Gen)\.?\s*\(?(?:R|Rtd|Retd|Retired)?\)?\s*/gi,
  /\b(?:Captain|Capt)\.?\s*/gi,
  /\b(?:Inspector|Insp)\.?\s*/gi,
  /\b(?:Sub\s*Inspector|SI|ASI|DSP|SSP|DIG|IG|SP)\b\s*/gi,
  /\b(?:Justice|Hon'?ble|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)\s*/gi,
  /\b(?:Syed|Syeda|Mian|Chaudhry|Ch\.?)\s*/gi,
];

const ROLE_SUFFIX_PATTERN = /\s*[–—-]\s*(Complainant|Respondent|Witness|Accused|Defendant|Petitioner|PW-?\d+|DW-?\d+).*/gi;
const BRACKET_PATTERN = /\([^)]*\)/g;

const SPELLING_VARIANTS: Record<string, string[]> = {
  muhammad: ['mohammad', 'mohd', 'muhammed', 'mohammed'],
  hussain: ['husain', 'husein', 'hussein'],
  ahmed: ['ahmad', 'ahamed'],
  mehwish: ['mehvish', 'mahwish', 'mahvish'],
  khan: ['kahn'],
  shah: ['shaah'],
  farrukh: ['farooq', 'farukh', 'farooque'],
  iqbal: ['ikbal'],
  saqib: ['saqeb', 'sakib'],
  mumtaz: ['mumtaaz'],
};

/**
 * Normalize a name for canonical matching:
 * 1. Lowercase
 * 2. Strip titles/ranks
 * 3. Remove brackets and role suffixes
 * 4. Normalize spelling variants
 * 5. Remove punctuation
 * 6. Collapse whitespace
 */
export function normalizeName(name: string): string {
  let result = name;

  // Strip titles
  for (const pattern of TITLE_PATTERNS) {
    result = result.replace(pattern, '');
  }

  // Remove brackets and role suffixes
  result = result.replace(BRACKET_PATTERN, '');
  result = result.replace(ROLE_SUFFIX_PATTERN, '');

  // Lowercase
  result = result.toLowerCase();

  // Normalize spelling variants
  for (const [canonical, variants] of Object.entries(SPELLING_VARIANTS)) {
    for (const variant of variants) {
      result = result.replace(new RegExp(`\\b${variant}\\b`, 'g'), canonical);
    }
  }

  // Remove punctuation except spaces
  result = result.replace(/[^a-z0-9\s]/g, '');

  // Collapse whitespace and trim
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}
