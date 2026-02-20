

# OSINT Intelligence Toolkit for HRPM

## Research Summary

After analyzing the current HRPM architecture, available APIs, and the OSINT landscape (Bellingcat toolkit, Trace Labs VM, ShadowDragon, MaxIntel, Flowsint), the following modules are **buildable** within your React/Supabase stack. Each leverages your existing entity network, evidence storage, and AI extraction pipeline.

---

## Tier 1: Immediately Buildable (No New APIs Required)

### 1. Digital Artifact Forensics Lab
Extract and analyze metadata from uploaded evidence files -- all client-side for privacy.

- **EXIF/Metadata Extraction**: Parse GPS coordinates, camera model, timestamps, software used from images using `exifreader` (npm library, runs in browser)
- **File Hash Calculator**: Generate SHA-256/MD5 hashes for evidence integrity verification and chain-of-custody
- **Timestamp Forensics**: Detect timezone inconsistencies, creation vs modification date anomalies
- **Document Metadata**: Extract author, revision history, software fingerprints from PDF/DOCX metadata
- **Storage**: Save all forensic findings to a new `artifact_forensics` table linked to `evidence_uploads`

### 2. Entity Enrichment Engine
Extend existing entity profiles with structured OSINT pivots.

- **Identity Pivot Generator**: From an entity name, auto-generate search queries for Google, social media, court records, corporate registries
- **Alias Cross-Reference**: Leverage existing `entity_aliases` table to map name variants, transliterations (Urdu/Arabic/English)
- **Connection Inference**: Use AI (Gemini) to suggest likely relationships between entities based on co-occurrence in documents, shared events, and temporal proximity
- **OSINT Dossier Export**: Generate a structured intelligence dossier per entity with all known data points

### 3. Web Evidence Archiver
Preserve web-based evidence before it disappears.

- **URL Snapshot**: Use Firecrawl connector (already available) to scrape and archive web pages as markdown + screenshots
- **Wayback Machine Integration**: Query the Internet Archive API (free, no key needed) to retrieve historical snapshots of URLs
- **Archive Storage**: Save archived content to `web_archives` table with timestamp, hash, and linked case/entity
- **Tampering Detection**: Compare current vs archived versions to detect content changes

---

## Tier 2: Buildable with Existing Connectors

### 4. Social Media Intelligence (SOCMINT) Scanner
Using Firecrawl connector for web scraping.

- **Profile Discovery**: Given a username, scrape public profiles across platforms via Firecrawl
- **Content Archiving**: Preserve social media posts as evidence before deletion
- **Network Mapping**: Extract mentioned users, hashtags, and connections to feed into the Entity Network graph
- **Sentiment/Narrative Analysis**: Use Gemini to analyze scraped social media content for narrative patterns and propaganda detection

### 5. Domain and Infrastructure Reconnaissance
Investigate websites and online infrastructure tied to entities.

- **WHOIS Lookup**: Query free WHOIS APIs (RDAP protocol, no key needed) for domain registration data
- **DNS History**: Resolve current and historical DNS records
- **Website Technology Fingerprinting**: Use Firecrawl's branding format to extract tech stack, hosting info
- **SSL Certificate Analysis**: Extract organization details from SSL certificates via public CT logs

### 6. Legal and Public Records Search
Extend the existing legal intelligence module.

- **Court Record Search**: Already implemented via CourtListener API -- extend to auto-search for all case entities
- **Corporate Registry Lookup**: Build search links for SECP (Pakistan), Companies House (UK), SEC EDGAR
- **Sanctions List Screening**: Check entities against UN, OFAC, EU sanctions lists (publicly available datasets)
- **News Monitoring**: Leverage existing `fetch-news` edge function to create persistent entity alerts

---

## Tier 3: Advanced Modules (AI-Powered)

### 7. Dark Web Artifact Analyzer
Process artifacts already collected from dark web/deep web sources.

- **Paste Site Content Analysis**: Upload text dumps from paste sites -- AI extracts emails, credentials, PII mentions related to case entities
- **Cryptocurrency Address Tracker**: Parse and log Bitcoin/Ethereum addresses found in artifacts, generate blockchain explorer links
- **Onion URL Cataloger**: Catalog .onion addresses found in evidence, track status over time
- **Threat Intelligence Correlation**: AI cross-references dark web mentions with known case entities and timelines
- **NOTE**: This does NOT access the dark web directly -- it analyzes artifacts already collected by investigators

### 8. Image and Video Intelligence (IMINT)
Forensic analysis of visual evidence.

- **Reverse Image Search Links**: Generate search URLs for Google Images, TinEye, Yandex for uploaded images
- **Geolocation Assistance**: Extract EXIF GPS data and display on map; AI suggests possible locations from visual cues
- **Deepfake/Manipulation Indicators**: AI analysis of image metadata inconsistencies (editing software, compression artifacts)
- **Video Frame Extraction**: Extract key frames from uploaded MP4 evidence for individual analysis

### 9. Communication Pattern Analyzer
Analyze communication metadata from uploaded evidence.

- **Phone Number Intelligence**: Parse phone numbers from documents, identify country/carrier via libphonenumber
- **Email Header Analysis**: Parse uploaded email headers to trace routing, detect spoofing indicators
- **Timeline Reconstruction**: Map communication patterns onto the existing case timeline
- **Network Graph Integration**: Auto-create entity connections based on communication evidence

---

## Technical Architecture

### New Database Tables

```text
artifact_forensics
  - id, evidence_upload_id, case_id
  - file_hash_sha256, file_hash_md5
  - exif_data (jsonb), metadata_raw (jsonb)
  - gps_lat, gps_lng, camera_model, software_used
  - creation_date, modification_date, timezone_anomaly
  - forensic_notes, analyst_findings
  - created_at

web_archives
  - id, url, case_id, entity_id
  - archived_content, archived_screenshot_url
  - content_hash, wayback_url
  - scrape_method, is_changed
  - created_at

osint_searches
  - id, case_id, entity_id, search_type
  - query, results (jsonb)
  - source_platform, findings_summary
  - created_at, created_by

dark_web_artifacts
  - id, case_id, artifact_type
  - content_text, source_description
  - extracted_entities (jsonb)
  - crypto_addresses (jsonb)
  - onion_urls (jsonb)
  - ai_analysis (jsonb)
  - created_at
```

### New Edge Functions

- `osint-enrich-entity`: Takes entity ID, runs enrichment queries, returns structured dossier
- `analyze-artifact-forensics`: Processes file metadata server-side for deeper analysis
- `archive-web-evidence`: Uses Firecrawl to scrape and archive a URL
- `analyze-dark-web-artifact`: AI analysis of uploaded dark web content

### New UI Pages/Components

- `/osint-toolkit` -- Main OSINT hub with tabs for each module
- `ForensicsLab` component -- File upload + metadata display + hash verification
- `EntityDossier` component -- Enriched profile view with all OSINT findings
- `WebArchiver` component -- URL input + archive history
- `ArtifactAnalyzer` component -- Dark web artifact upload + AI analysis

### Integration Points

- Entity Network graph receives new connections from OSINT discoveries
- Evidence Matrix links to forensic analysis results
- Timeline automatically incorporates OSINT-discovered events
- Global Search indexes all OSINT findings
- Analysis History logs all OSINT activities

---

## Implementation Priority

| Phase | Module | Effort | Impact |
|-------|--------|--------|--------|
| 1 | Digital Artifact Forensics Lab | Medium | High -- immediate evidence integrity |
| 1 | Entity Enrichment Engine | Medium | High -- enriches existing profiles |
| 2 | Web Evidence Archiver | Low | High -- evidence preservation |
| 2 | Domain Reconnaissance | Low | Medium -- infrastructure intel |
| 3 | Social Media Intelligence | Medium | High -- new evidence sources |
| 3 | Dark Web Artifact Analyzer | Medium | High -- unique capability |
| 4 | Image/Video Intelligence | High | Medium -- visual forensics |
| 4 | Communication Pattern Analyzer | Medium | Medium -- metadata intel |

---

## NPM Libraries Required

- `exifreader` -- Client-side EXIF/metadata extraction
- `crypto-js` or Web Crypto API -- File hashing (SHA-256, MD5)
- `libphonenumber-js` -- Phone number parsing and validation
- No additional API keys needed for Phase 1-2 (uses existing Gemini AI + Firecrawl connector)

