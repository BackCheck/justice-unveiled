INSERT INTO public.changelog_entries (version, title, description, category, release_date, is_published, changes)
VALUES (
  '2.10.0',
  'Report QA Engine & Court-Mode Appendices',
  'Hard QA assertions now validate every report before generation. Court-mode reports auto-include List of Dates and Key Issues appendices. Network metric discrepancies are resolved with a unified snapshot.',
  'major',
  '2026-02-27',
  true,
  '["Pre-generation QA engine with critical/warning assertions blocks unsafe exports across all entry points","QA modal shows error summary with fix suggestions — admin-only bypass for critical issues","Unified network snapshot hook resolves 0-connections vs relationships discrepancy with smart labeling","Front-matter blocks (Methodology, Definitions, Data Quality) auto-injected for Comprehensive Investigation reports","Critical Findings upgraded: top discrepancy types table, top hostile entities table, and 5 exemplar event cards","Timeline block upgraded: labeled CSS bar chart with spike callouts and peak-year annotations","Court-mode auto-appends Appendix A (List of Dates) and Appendix B (Key Issues via Issue Framing Engine)","Strict Factual Mode toggle prevents hallucinated statutes and case law in court filings","Court Readiness Score with weighted breakdown (sections, content, annexures, parties, verification)","QA audit trail logged for every export including bypass events","All export buttons wired through QA preflight — zero bypass paths","Percent statements enforced to show numerator/denominator format (81/352 = 23.0%)"]'::jsonb
);