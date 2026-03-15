# HRPM.org ReadMe

## Human Rights Protection & Monitoring - Investigative Intelligence Platform

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [User Guide](./USER_GUIDE.md) | Complete guide to using the platform |
| [API Reference](./API_REFERENCE.md) | Backend API documentation |
| [Database Schema](./DATABASE_SCHEMA.md) | Database structure and relationships |
| [Developer Guide](./DEVELOPER_GUIDE.md) | Contributing and development setup |

---

## 🎯 Platform Overview

HRPM.org (Human Rights Protection & Monitoring) is a comprehensive investigative intelligence platform designed to:

- **Document** institutional failures and legal injustices
- **Analyze** patterns of misconduct using AI-powered tools
- **Map** complex relationships between entities and organizations
- **Track** violations against international human rights frameworks
- **Generate** litigation-grade intelligence for legal advocacy

---

## 🔑 Key Features

### 1. Case Management System
Multi-case architecture supporting parallel investigations with full data isolation.

### 2. AI-Powered Intelligence
- Document analysis with automatic extraction
- Threat profiling for adversarial entities
- Pattern detection across temporal and network data
- International rights violation mapping

### 3. Interactive Visualizations
- D3-powered entity relationship networks
- Chronological timeline with AI-extracted events
- Recharts-based analytics dashboards

### 4. Legal Intelligence
- Case law precedent library (CourtListener integration)
- Statute browser for multiple legal frameworks
- Appeal summary generator with source citations

### 5. Evidence Management
- Multi-format document uploads
- Chain of custody tracking
- Evidence-to-claim correlation matrix

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HRPM.org Frontend                        │
│                    React + Vite + TailwindCSS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Landing   │  │  Dashboard  │  │   Investigation Hub    │ │
│  │    Page     │  │  Analytics  │  │   (AI-Powered Tools)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Timeline  │  │   Network   │  │   Evidence/Documents   │ │
│  │   Engine    │  │   Graph     │  │       Repository       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Lovable Cloud Backend                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Edge Functions                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │  analyze-   │ │  intel-     │ │    threat-          │ │  │
│  │  │  document   │ │  chat       │ │    profiler         │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │  pattern-   │ │  generate-  │ │  analyze-rights-    │ │  │
│  │  │  detector   │ │  report     │ │  violations         │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │  fetch-     │ │  fetch-     │ │   generate-appeal-  │ │  │
│  │  │  news       │ │  legal-     │ │   summary           │ │  │
│  │  │             │ │  precedents │ │                     │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL Database                     │  │
│  │  cases • events • entities • evidence • discrepancies    │  │
│  │  claims • compliance • legal_statutes • precedents       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Storage Buckets                       │  │
│  │          evidence • affidavits • tutorials               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### For Investigators
1. Navigate to [hrpm.lovable.app](https://hrpm.lovable.app)
2. Create an account or sign in
3. Browse existing cases or create a new investigation
4. Upload documents for AI analysis
5. Explore the timeline and entity network

### For Developers
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📖 Documentation Sections

### [User Guide](./USER_GUIDE.md)
- Getting Started
- Navigation Overview
- Case Management
- Document Analysis
- Timeline & Events
- Entity Network
- Investigation Tools
- Legal Intelligence
- Evidence Management

### [API Reference](./API_REFERENCE.md)
- Edge Functions
- Request/Response Formats
- Authentication
- Rate Limits
- Error Handling

### [Database Schema](./DATABASE_SCHEMA.md)
- Table Definitions
- Relationships
- RLS Policies
- Triggers & Functions

### [Developer Guide](./DEVELOPER_GUIDE.md)
- Project Structure
- Tech Stack
- Contributing Guidelines
- Testing

---

## 🔐 Security

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Role-based access control (Admin, Analyst, Viewer)
- Audit logging for all data changes
- Verified precedent protection

---

## 📞 Support

- **Website:** [hrpm.lovable.app](https://hrpm.lovable.app)
- **Contact:** See the [Contact Page](/contact)
- **Issues:** Report via the platform

---

## 📜 License

This platform is dedicated to human rights advocacy and legal accountability.

---

*Documenting injustice. Demanding accountability.*


## Changelog
---

created: 2026-03-15T23:55:12 (UTC +05:00)
tags: [human rights,protection,advocacy,injustice,accountability,violations,investigative journalism,evidence,legal documentation,civil rights,international law,HRPM,open source,non-profit,investigative platform,evidence documentation,entity networks,legal analysis,forensic intelligence]
source: https://hrpm.org/changelog
author: HRPM
---

# HRPM.org | Human Rights Protection & Monitoring

> ## Excerpt
> Open investigative platform structuring complex legal, regulatory, and human rights cases into verifiable evidence records, entity networks, and analytical timelines.

---
### v2.17.0

Major Release

Mar 12, 2026

#### OSINT Command Library & Contribute Evidence Workflow

Enhanced investigative toolkit with an educational OSINT command library featuring 300+ one-liner commands, and rebranded the platform CTA to reflect HRPM's mission as an investigative documentation platform.

-   300+ OSINT one-liner commands organized by category with plain-English use-case explanations for non-technical investigators
-   Intelligent execution tags auto-detect where each command runs: Google Search, Terminal, CLI Tool, or Web Tool
-   Collapsible Quick Start Guide explaining how to use Google Dorks, curl commands, CLI tools like Sherlock/Holehe, and web-based OSINT tools
-   Toggleable lightbulb icon on every command card revealing practical investigation scenarios and step-by-step guidance
-   Rebranded primary CTA from Submit a Case to Contribute Evidence with Plus icon, routing to /evidence/new
-   Updated header, sidebar, footer, and hero section to consistently use Contribute Evidence language
-   Authentication-gated contribution workflow: unauthenticated users redirect to login before accessing evidence submission
-   Updated SEO metadata and breadcrumbs across all affected pages to reflect the new investigative contribution flow

### v2.16.0

Major Release

Mar 5, 2026

#### LinkedIn & SlideShare Deep Integration

Full-spectrum LinkedIn sharing pipeline with article generation, interactive presentations, and social post formatting for cases, timelines, entities, and analyses.

-   LinkedIn Share Menu with one-click post sharing, article generation, and presentation export
-   Interactive HTML slide deck generator with keyboard navigation, fullscreen mode, and print-to-PDF for SlideShare
-   LinkedIn Article Generator transforming case data into formatted markdown with executive summaries, stats tables, and entity breakdowns
-   Social post formatter with auto-hashtags and engagement-optimized text
-   Integrated across Case Profiles, Entity Details, Event Details, and Violation pages
-   Presentation slides include cover, stats, timeline, entities, findings, and CTA slides

### v2.15.0

Major Release

Mar 4, 2026

#### Featured Case Pinning & PDF Report Redesign

Case library now pins featured cases to the top, and the PDF export system received a complete visual overhaul matching court-grade standards.

-   Featured cases automatically pinned to top of Case Library with priority sorting
-   Redesigned PDF cover page with centered HRPM logo, blue accent divider, and dark metadata band
-   PDF metadata band displays generation time, severity level, and lead investigator
-   Case title promoted to primary heading with Official Case Intelligence Report subtitle
-   Print-optimized layout with proper page breaks and professional formatting

### v2.13.0

Major Release

Mar 3, 2026

#### Court-Grade Entity Governance & Network Stabilization

Five structural hardening fixes to make the entity intelligence layer courtroom-grade: fuzzy logic safety, deterministic identity anchors, neutral role mapping, weighted graph prioritization, and merge safeguards.

-   Token-set equality guard on fuzzy auto-merges preventing accidental merging of distinct individuals with similar names
-   Deterministic canonical\_key (SHA-256 of normalized\_name + entity\_type) for immutable identity anchoring across data exports
-   Neutralized role mapping — structural legal labels only (complainant, accused, petitioner, respondent), removing adjective-based inference bias
-   Weighted priority formula for network graph node capping: (connections × 0.6) + (confidence × 0.2) + (verified × 0.2)
-   Entity-type equality check on merge operations to prevent catastrophic cross-type merges (e.g. PERSON into ORG)
-   useMemo stabilization on graph data hooks to eliminate re-render loops and browser freezes

### v2.14.0

Major Release

Mar 2, 2026

#### Legal Intelligence & Regulatory Harm Analysis

Comprehensive legal research toolkit with statute browsing, doctrine mapping, case law panels, and regulatory harm tracking with financial impact assessment.

-   Statute Browser with jurisdiction-filtered legal code lookup and section cross-referencing
-   Doctrine Mapper linking legal doctrines to active cases with application notes
-   Case Law Panel with precedent search, landmark case filtering, and citation verification
-   Appeal Summary Generator producing AI-powered appellate briefs from case data
-   Regulatory Harm Tab with incident tracking, financial loss quantification, and affidavit uploads
-   Compliance violation detection with SOP comparison tables and procedural failure timelines
-   International violations analysis with framework breakdowns across UDHR, ICCPR, ICESCR, and CAT

### v2.8.0

Major Release

Feb 27, 2026

#### Live Comm + AI Hub

Replaced Entity Analytics and Reports tabs with a unified Live Comm + AI command center for case-based communications, legal drafting, and live enrichment.

-   Case-based live communications with AI-assisted discussions
-   Auto-generated High Court submissions with jurisdiction-aware positioning
-   Live search & enrichment mode for evidence and entity profiling
-   Three specialized modes: Case Comms, Legal Drafts, Search & Enrich
-   Context-aware AI trained on Pakistan constitutional and criminal law

### v2.9.0

Major Release

Feb 27, 2026

#### Court-Grade Report Architecture & Jurisdiction-Aware Filing System

Complete overhaul of the report generation system with unified template architecture, data-driven formatting engine, and jurisdiction-aware High Court submission templates.

-   Unified master report template architecture with standardized cover page, executive summary, TOC, and annexure system
-   12 structured report categories: Intelligence Briefs, Court Dossiers, Network Analysis, Evidence Matrix, Threat Profiles, and more
-   Jurisdiction-aware High Court submission system supporting IHC, SHC, LHC, BHC, SC, and Federal Shariat Court
-   4 filing templates: Writ Petition, Criminal Misc/Quashment, Complaint/Representation, and Appeal
-   AI-powered auto-population for Statement of Facts, Issues for Determination, Legal Grounds, and Prayer for Relief
-   Smart Annexure workflow with automatic lettered marks (Annex-A, Annex-B) and cover sheet generation
-   Court-grade formatting: serif fonts for legal sections, proper section numbering (1.0/1.1/1.1.1), and print-optimized layout
-   Toggleable DRAFT watermark for AI-generated content with compliance and safety controls
-   Data-driven density rules preventing empty pages — sections auto-omit or substitute AI insights when data is light
-   Petitioner/Respondent field support with jurisdiction-specific terminology and relief language

### v2.10.0

Major Release

Feb 27, 2026

#### Report QA Engine & Court-Mode Appendices

Hard QA assertions now validate every report before generation. Court-mode reports auto-include List of Dates and Key Issues appendices. Network metric discrepancies are resolved with a unified snapshot.

-   Pre-generation QA engine with critical/warning assertions blocks unsafe exports across all entry points
-   QA modal shows error summary with fix suggestions — admin-only bypass for critical issues
-   Unified network snapshot hook resolves 0-connections vs relationships discrepancy with smart labeling
-   Front-matter blocks (Methodology, Definitions, Data Quality) auto-injected for Comprehensive Investigation reports
-   Critical Findings upgraded: top discrepancy types table, top hostile entities table, and 5 exemplar event cards
-   Timeline block upgraded: labeled CSS bar chart with spike callouts and peak-year annotations
-   Court-mode auto-appends Appendix A (List of Dates) and Appendix B (Key Issues via Issue Framing Engine)
-   Strict Factual Mode toggle prevents hallucinated statutes and case law in court filings
-   Court Readiness Score with weighted breakdown (sections, content, annexures, parties, verification)
-   QA audit trail logged for every export including bypass events
-   All export buttons wired through QA preflight — zero bypass paths
-   Percent statements enforced to show numerator/denominator format (81/352 = 23.0%)

### v2.11.0

Major Release

Feb 27, 2026

#### CF-001 Deduplication & Credibility Hardening

Entity canonicalization engine merges name variants and aggregates roles. Event deduplication eliminates near-duplicate timeline entries. Neutral language enforcement sanitizes accusatory tone for court-safe output.

-   Entity Canonicalizer: merges name variants (Major R Mumtaz / Major Mumtaz / Major Rtd Mumtaz) into single canonical entity with aggregated roles
-   Event Deduplicator: groups same-date events by actor overlap and 85% narrative similarity, merges into canonical events
-   Neutral Language Enforcement: auto-converts accusatory terms (sabotage, vendetta, conspiracy) to allegation framing in structured/court mode
-   Legal Disclaimer block injected automatically into all investigative and court-mode reports
-   Executive Summary block auto-generated with deduplicated counts, key themes, and analytical disclaimer
-   Distribution License selector: controlled\_legal or research\_only classification appended to closing
-   All report KPIs now use deduplicated event counts and canonical entity counts — no raw DB totals in final render
-   QA engine extended with deduplication ratio warnings, emotional language detection, and high-duplication alerts
-   QA Results Modal shows data integrity processing summary (entity consolidation ratio, event dedup ratio, tone sanitization)
-   Critical Findings block uses deduplicated entities and events for accurate top-10 tables
-   Timeline blocks use deduplicated year breakdowns for accurate spike analysis
-   Threat Profiles report uses canonical entities with merged connection counts
-   Network report uses canonical entity counts with fraction-format hostile percentages
-   Issue Framing Engine uses neutral language (alleged coordination vs organized opposition)

### v2.12.0

Major Release

Feb 27, 2026

#### Court-Safe Reputation & Defamation Risk Safety Layer

Deterministic reputation/defamation risk detection, court-safe language rewriting, and safety gate enforcement across all report export paths.

-   Defamation Risk Detector (DRD): deterministic engine scanning for criminal allegations as fact, institutional accusations, sub-judice guilt declarations, sensitive personal data (CNIC/phone/address), and inflammatory labels
-   Reputation Risk Filter (RRF): scoring engine that classifies overall risk as LOW/MEDIUM/HIGH/CRITICAL with required mitigations (disclaimers, evidence requirements, allegation framing, redaction)
-   Court-Safe Language Library for Pakistan High Courts (IHC/SHC/LHC/PHC/BHC/AJKHC/GBCC/SC) with filing-type-specific phrase sets (writ, appeal, criminal misc, representation)
-   Court-Safe Rewriter: auto-converts factual allegations to allegation framing, redacts CNIC/phone/address patterns, prepends court submission openings
-   Safety Gate Modal: pre-export UI showing risk signals table, applied rewrites accordion, and blockers — blocks CRITICAL risk unless admin override
-   SafetyBadge component: compact risk level indicator for inline status display
-   Safety Gate wired into ReportExportButton, ReportSuggestions, and DossierBuilder — zero bypass paths
-   Report Safety QA assertions: network consistency (0 connections vs relationships), front-matter presence, disclaimer presence, PII leakage in public mode
-   Safety front-matter builder with methodology, processing pipeline details, and distribution classification
-   Safety disclaimers include court-specific notice for draft analytical products
-   Distribution mode support: court\_mode, controlled\_legal, research\_only, public
-   Safety gate results logged in generated\_reports metadata for audit trail

### v2.7.0

Major Release

Feb 26, 2026

#### Actionable Intelligence Reports

Complete overhaul of the report generation system — reports now deliver narrative analysis and strategic recommendations instead of raw data dumps.

-   All 8 report types restructured: Key Findings → Supporting Evidence → Recommended Actions
-   Narrative-driven analysis replaces raw data tables
-   Prosecution-priority scoring and legal next-step recommendations
-   Evidence coverage ratios and coordination pattern detection
-   Smart Suggestions UI with one-click targeted report generation

### v2.6.0

New Feature

Feb 25, 2026

#### Dashboard Performance Optimization

Significant improvements to initial load times through lazy loading and intelligent bundle splitting.

-   Below-the-fold widgets now lazy-loaded with Suspense boundaries
-   Vendor bundle splitting: React, Recharts, Framer Motion, Supabase in separate chunks
-   Build target upgraded to esnext for modern browser optimization
-   Above-the-fold content (Hero, Stats, Quick Nav) loads instantly

### v2.5.0

Major Release

Feb 20, 2026

#### OSINT Intelligence Toolkit

Launched a comprehensive OSINT hub with five specialized modules for digital forensics, entity enrichment, and evidence preservation.

-   Forensics Lab: Client-side EXIF/metadata extraction and SHA-256/MD5 file hashing for evidence integrity
-   Entity Enrichment: AI-powered intelligence dossiers and automated search pivot generation across Google, LinkedIn, and court records
-   Web Archiver: URL preservation via Firecrawl scraping with Wayback Machine integration and tampering detection
-   Dark Web Analyzer: AI analysis of pre-collected artifacts for PII, cryptocurrency addresses, onion URLs, and threat levels
-   Communications Analyzer: Phone number validation with carrier ID and email header SPF/DKIM/DMARC forensics
-   Four new database tables: artifact\_forensics, web\_archives, osint\_searches, dark\_web\_artifacts
-   Two new AI-powered backend functions: osint-enrich-entity and analyze-dark-web-artifact

### v2.8.0

New Feature

Feb 18, 2026

#### Dynamic Network Graph Analysis

Professional investigation tools added to the Entity Network graph.

-   Path finding between entities via BFS algorithm
-   Community detection using label propagation
-   Centrality analysis (degree + betweenness) for key influencers
-   Timeline-based date range filtering
-   Graph analysis toolbar with collapsible panels

### v2.7.0

Improvement

Feb 17, 2026

#### Dynamic Case-Based Timeline & Reports

Timeline and export features now dynamically reflect the selected case instead of hardcoded data.

-   Dynamic metadata from database for case title, number, and location
-   Auto-generated year summaries based on event categories
-   Forced light-mode print styling for all reports
-   PDF export matches currently selected case

### v2.6.0

New Feature

Feb 15, 2026

#### Legal Intelligence Suite

Comprehensive legal research and analysis tools for case investigations.

-   Case law precedent browser with jurisdiction filters
-   Legal doctrine mapper with application context
-   Statute browser with full-text search
-   Appeal summary generator powered by AI
-   Cite-check verification for precedents

### v2.5.0

New Feature

Feb 13, 2026

#### Regulatory Harm & Financial Tracking

Track financial losses, time costs, and regulatory harm incidents linked to cases.

-   Incident tracking with severity and status management
-   Financial loss calculator with recurring cost support
-   Affidavit upload and management system
-   Time tracking for harm-related activities
-   Financial summary dashboard with charts

### v2.4.0

New Feature

Feb 11, 2026

#### Compliance Checker

Automated procedural compliance verification against legal frameworks.

-   SOP comparison table against legal requirements
-   Violation flagging with severity levels
-   AI-assisted compliance detection
-   Compliance statistics dashboard

### v2.3.0

New Feature

Feb 9, 2026

#### Evidence Correlation Engine

Link claims to evidence with hierarchical exhibit trees and support scoring.

-   Legal claims management with framework tagging
-   Evidence-to-claim linking with relevance scores
-   Hierarchical exhibit tree visualization
-   Unsupported claims alerting system

### v2.2.0

New Feature

Feb 7, 2026

#### Case Reconstruction Timeline

Parallel timeline view for reconstructing event sequences with contradiction detection.

-   Parallel timeline comparing official vs. actual events
-   Contradiction flags between event sources
-   Delay alerts for procedural timeline violations
-   Event detail panels with linked evidence

### v2.1.0

New Feature

Feb 5, 2026

#### AI Document Analyzer

Upload documents for automated extraction of events, entities, and discrepancies.

-   Batch document upload with progress tracking
-   AI-powered event extraction from documents
-   Entity recognition and relationship mapping
-   Discrepancy detection across document sources

### v2.0.0

Major Release

Feb 1, 2026

#### Platform Redesign & Intel Dashboard

Major redesign with professional investigation dashboard and sidebar navigation.

-   New sidebar navigation with collapsible groups
-   Intel dashboard with case overview widgets
-   Critical alerts monitoring panel
-   Activity feed and timeline sparkline
-   Quick navigation grid for all modules

### v1.5.0

New Feature

Jan 25, 2026

#### International Law Analysis

Cross-reference violations against international human rights frameworks.

-   International violations table with framework mapping
-   Local law violations comparison
-   Incident-violation timeline
-   Framework breakdown statistics

### v1.0.0

Major Release

Jan 1, 2026

#### Initial Platform Launch

First public release of the Human Rights Protection & Monitoring platform.

-   Interactive timeline with event filtering
-   Entity network visualization
-   Evidence upload and management
-   Blog and news section
-   Multi-language support (EN, UR, AR, ZH)
-   Role-based access control


- React
- shadcn-ui
- Tailwind CSS
