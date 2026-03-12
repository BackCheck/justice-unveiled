INSERT INTO changelog_entries (version, title, description, category, release_date, is_published, changes)
VALUES (
  '2.17.0',
  'OSINT Command Library & Contribute Evidence Workflow',
  'Enhanced investigative toolkit with an educational OSINT command library featuring 300+ one-liner commands, and rebranded the platform CTA to reflect HRPM''s mission as an investigative documentation platform.',
  'major',
  '2026-03-12',
  true,
  '["300+ OSINT one-liner commands organized by category with plain-English use-case explanations for non-technical investigators","Intelligent execution tags auto-detect where each command runs: Google Search, Terminal, CLI Tool, or Web Tool","Collapsible Quick Start Guide explaining how to use Google Dorks, curl commands, CLI tools like Sherlock/Holehe, and web-based OSINT tools","Toggleable lightbulb icon on every command card revealing practical investigation scenarios and step-by-step guidance","Rebranded primary CTA from Submit a Case to Contribute Evidence with Plus icon, routing to /evidence/new","Updated header, sidebar, footer, and hero section to consistently use Contribute Evidence language","Authentication-gated contribution workflow: unauthenticated users redirect to login before accessing evidence submission","Updated SEO metadata and breadcrumbs across all affected pages to reflect the new investigative contribution flow"]'
);