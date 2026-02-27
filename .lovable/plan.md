

## Plan: Update Changelog with Court-Grade Report Architecture

### What to add

Insert a new changelog entry (v2.9.0, category: major) documenting the **Court-Grade Report Architecture & Jurisdiction-Aware Filing System** — the unified report template architecture, data-driven formatting engine, and High Court submission system.

### Implementation

1. **Insert changelog entry via database migration** with:
   - **Version**: 2.9.0
   - **Title**: Court-Grade Report Architecture & Jurisdiction-Aware Filing System
   - **Category**: major
   - **Description**: Complete overhaul of the report generation system with unified template architecture, data-driven formatting engine, and jurisdiction-aware High Court submission templates.
   - **Changes** (array):
     - Unified master report template architecture with standardized cover page, executive summary, TOC, and annexure system
     - 12 structured report categories: Intelligence Briefs, Court Dossiers, Network Analysis, Evidence Matrix, Threat Profiles, and more
     - Jurisdiction-aware High Court submission system supporting IHC, SHC, LHC, BHC, SC, and Federal Shariat Court
     - 4 filing templates: Writ Petition, Criminal Misc/Quashment, Complaint/Representation, and Appeal
     - AI-powered auto-population for Statement of Facts, Issues for Determination, Legal Grounds, and Prayer for Relief
     - Smart Annexure workflow with automatic lettered marks (Annex-A, Annex-B) and cover sheet generation
     - Court-grade formatting: serif fonts for legal sections, proper section numbering (1.0/1.1/1.1.1), and print-optimized layout
     - Toggleable DRAFT watermark for AI-generated content with compliance and safety controls
     - Data-driven density rules preventing empty pages — sections auto-omit or substitute AI insights when data is light
     - Petitioner/Respondent field support with jurisdiction-specific terminology and relief language

