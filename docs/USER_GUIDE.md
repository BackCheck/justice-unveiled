# HRPM.org User Guide

## Complete Guide to the Human Rights Protection Movement Platform

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Platform Navigation](#platform-navigation)
3. [Case Management](#case-management)
4. [Document Analysis](#document-analysis)
5. [Interactive Timeline](#interactive-timeline)
6. [Entity Network](#entity-network)
7. [Investigation Hub](#investigation-hub)
8. [OSINT Intelligence Toolkit](#osint-intelligence-toolkit)
9. [Legal Intelligence](#legal-intelligence)
10. [Evidence Management](#evidence-management)
11. [International Rights Analysis](#international-rights-analysis)
12. [Watchlist & Tracking](#watchlist--tracking)
13. [Reports & Export](#reports--export)
7. [Investigation Hub](#investigation-hub)
8. [Legal Intelligence](#legal-intelligence)
9. [Evidence Management](#evidence-management)
10. [International Rights Analysis](#international-rights-analysis)
11. [Watchlist & Tracking](#watchlist--tracking)
12. [Reports & Export](#reports--export)

---

## Getting Started

### Creating an Account

1. Navigate to [hrpm.lovable.app](https://hrpm.lovable.app)
2. Click **"Sign Up"** or **"Get Started"**
3. Enter your email and create a password
4. Verify your email address
5. Complete your profile setup

### User Roles

| Role | Permissions |
|------|-------------|
| **Viewer** | Read-only access to public case data |
| **Analyst** | Full access to case data, document uploads, AI tools |
| **Admin** | All analyst permissions + user management, audit logs |

### First Login

After logging in, you'll be directed to the **Dashboard** where you can:
- View case overview statistics
- Access the AI Case Analyst chat
- Navigate to different platform sections

---

## Platform Navigation

### Global Navigation

The platform features a collapsible sidebar with the following sections:

#### 📊 Intelligence
- **Dashboard** - Analytics overview and AI chat
- **Timeline** - Chronological event visualization
- **Network** - Entity relationship graph
- **Investigations** - AI-powered analysis tools

#### 📁 Case Management
- **Cases** - Browse and manage investigations
- **Evidence** - Document uploads and evidence matrix
- **Uploads** - Central document repository

#### ⚖️ Legal & Compliance
- **Legal Intelligence** - Case law and statutes
- **International Analysis** - Rights violation mapping
- **Compliance** - Procedural compliance tracking

#### 🔧 Tools
- **Analyze** - AI document analyzer
- **Legal Research** - Statute and precedent browser
- **OSINT Toolkit** - Digital forensics, entity enrichment, web archiving, dark web analysis

### Quick Actions

Press **⌘K** (Mac) or **Ctrl+K** (Windows) to open the global search/command palette:
- Search for cases, entities, or events
- Quick navigation to any page
- Access common actions

### Breadcrumbs

Automatic breadcrumb navigation appears at the top of each page for easy backtracking.

---

## Case Management

### Viewing Cases

Navigate to **Cases** to see all active investigations:

| Field | Description |
|-------|-------------|
| Case Number | Unique identifier (e.g., CF-001) |
| Title | Investigation name |
| Status | Active, Under Review, Closed |
| Severity | Critical, High, Medium, Low |
| Category | Persecution, Regulatory Abuse, etc. |

### Case Profile

Each case profile contains tabbed sections:

1. **Overview** - Summary statistics and key findings
2. **Timeline** - Case-specific chronological events
3. **Network** - Entity relationships for this case
4. **Intelligence** - AI analysis and briefings
5. **Evidence** - Documents linked to this case
6. **Reconstruction** - Parallel timeline analysis
7. **Correlation** - Claim-to-evidence mapping
8. **Compliance** - Procedural compliance checklist
9. **Economic Harm** - Financial damage tracking
10. **Legal** - Linked statutes and precedents

### Creating a New Case

1. Navigate to **Cases**
2. Click **"+ New Case"**
3. Fill in required fields:
   - Case Number
   - Title
   - Description
   - Category
   - Severity
   - Location
4. Click **"Create Case"**

---

## Document Analysis

### AI-Powered Document Analyzer

The Document Analyzer (`/analyze`) uses AI to automatically extract intelligence from uploaded documents.

### How to Analyze Documents

1. Navigate to **Analyze**
2. **Select a Case** (optional but recommended)
3. Choose input method:
   - **Paste Text** - Paste document content directly
   - **Upload Files** - Upload PDF, DOCX, images
4. Select **Document Type**:
   - Legal Document
   - Court Filing
   - Police Report
   - News Article
   - Regulatory Filing
   - Correspondence
5. Click **"Analyze Document"**

### What Gets Extracted

| Category | Description |
|----------|-------------|
| **Events** | Timeline events with dates, categories, descriptions |
| **Entities** | People, organizations, official bodies |
| **Discrepancies** | Procedural failures, evidence issues |
| **Legal Claims** | Allegations and charges with legal references |
| **Compliance Violations** | Constitutional and procedural violations |
| **Financial Harm** | Economic damage incidents |

### Reviewing Extractions

- Events are automatically tagged with confidence scores
- AI-extracted data is marked with a special badge
- Admins can approve/reject extracted events
- Events can be hidden from the public timeline

### Analysis History

View previous analysis jobs in the **Analyzed Data Summary** section:
- Job status (pending, processing, completed, failed)
- Extraction counts
- Error messages

---

## Interactive Timeline

### Timeline View (`/timeline`)

The timeline provides a chronological visualization of all case events.

### Features

1. **Filtering**
   - By category (Business Interference, Harassment, Legal Proceeding, Criminal Allegation)
   - By date range
   - By case
   - Search by keyword

2. **Event Details**
   Each event card displays:
   - Date
   - Category with color coding
   - Description
   - Individuals involved
   - Legal action taken
   - Outcome
   - Evidence discrepancies
   - Source references
   - AI extraction badge (if applicable)
   - Confidence score

3. **Year Markers**
   Visual separators for each year in the timeline

4. **Timeline Slider**
   Drag to filter events by date range

### Event Actions

- **View Details** - Open full event information
- **Add to Watchlist** - Track specific events
- **Link Evidence** - Connect documents to events
- **Share** - Generate shareable link

---

## Entity Network

### Network Graph (`/network`)

The Entity Network is an interactive D3-powered visualization showing relationships between all entities in the investigation.

### Node Types

| Type | Visual | Description |
|------|--------|-------------|
| Person | Circle | Individual people |
| Organization | Diamond | Companies, businesses |
| Official Body | Square | Government agencies |
| Legal Entity | Pentagon | Courts, legal institutions |

### Node Categories

| Category | Color | Description |
|----------|-------|-------------|
| Protagonist | Green | Victims, allies |
| Antagonist | Red | Alleged perpetrators |
| Neutral | Gray | Neutral parties |
| Official | Blue | Government officials |

### Relationship Types

- Family
- Professional
- Adversarial
- Financial
- Legal
- Chain of Command

### Interactions

1. **Zoom & Pan** - Mouse wheel or pinch to zoom
2. **Drag Nodes** - Reposition entities
3. **Click Node** - Open details panel
4. **Right-Click** - Context menu with actions
5. **Search** - Find specific entities
6. **Filter** - Show/hide by type or category

### Details Panel

Clicking a node opens a slide-out panel showing:
- Entity profile
- Role and description
- Aliases (CNICs, emails, phones)
- Connected entities
- Related events
- Influence score
- Role tags

### Cluster Detection

The graph automatically identifies clusters of related entities, highlighted with pulsed SVG background hulls.

---

## Investigation Hub

### Overview (`/investigations`)

The Investigation Hub is a specialized workspace with AI-powered analysis tools.

### Available Modules

#### 1. Threat Profiler

Generate detailed threat profiles for adversarial entities.

**How to Use:**
1. Select an entity from the dropdown
2. Click **"Generate Profile"**
3. Review the AI-generated assessment:
   - Threat level (Critical/High/Medium/Low)
   - Behavioral motivations
   - Known tactics
   - Network connections
   - Exploitable vulnerabilities
   - Strategic recommendations

#### 2. Pattern Detector

Identify hidden patterns across the investigation data.

**Pattern Types:**
- **Temporal** - Clusters of events in specific time periods
- **Network** - Highly connected coordinator entities
- **Behavioral** - Repeated tactics or systematic actions
- **Anomaly** - Unusual discrepancies

**How to Use:**
1. Click **"Detect Patterns"**
2. Review detected patterns with confidence scores
3. Drill down into supporting evidence

#### 3. Risk Assessment

Evaluate case strength and risk factors.

**Metrics:**
- Evidence strength score
- Procedural compliance rating
- Likelihood of success
- Key risk factors

#### 4. Link Analysis

Deep-dive into entity connections.

**Features:**
- Connection strength visualization
- Intermediary identification
- Timeline of relationship changes

#### 5. Report Generator

Create formal investigation reports.

**Report Sections:**
- Executive Summary
- Detailed Analysis
- Evidence Inventory
- Procedural Findings
- Recommendations

**How to Generate:**
1. Enter report title
2. Select sections to include
3. Add additional context
4. Click **"Generate Report"**
5. Export as Markdown

---

## OSINT Intelligence Toolkit

### Overview (`/osint-toolkit`)

The OSINT Intelligence Toolkit provides five specialized modules for open-source intelligence gathering, digital forensics, and investigative enrichment.

### Module 1: Forensics Lab

Extract and verify metadata from uploaded evidence files — all processing happens client-side for privacy.

**Features:**
- **EXIF/Metadata Extraction** - Parse GPS coordinates, camera model, timestamps, software from images
- **File Hash Calculator** - Generate SHA-256 and MD5 hashes for evidence integrity and chain-of-custody
- **Timestamp Forensics** - Detect timezone inconsistencies, creation vs modification date anomalies
- **Findings Persistence** - Save forensic analysis to the `artifact_forensics` table linked to evidence uploads

**How to Use:**
1. Navigate to **OSINT Toolkit** → **Forensics Lab**
2. Upload an image or document file
3. View extracted metadata (EXIF, GPS, camera info)
4. Copy file hashes for chain-of-custody records
5. Save findings to the case database

### Module 2: Entity Enrichment

Extend existing entity profiles with structured OSINT pivots and AI-generated intelligence dossiers.

**Features:**
- **Search Pivot Generator** - Auto-generate search queries for Google, LinkedIn, court records, corporate registries
- **AI Dossier Generation** - Create comprehensive intelligence dossiers using AI analysis
- **Alias Cross-Reference** - Map name variants and transliterations across languages

**How to Use:**
1. Select an entity from the dropdown
2. Click **Generate Search Pivots** for external search links
3. Click **Generate AI Dossier** for a comprehensive intelligence report
4. Review and save findings

### Module 3: Web Archiver

Preserve web-based evidence before it disappears using Firecrawl scraping and Wayback Machine integration.

**Features:**
- **URL Snapshot** - Scrape and archive web pages as markdown with content hashing
- **Wayback Machine Integration** - Query the Internet Archive for historical snapshots
- **Tampering Detection** - Compare current vs archived versions to detect content changes

### Module 4: Dark Web Analyzer

Process artifacts already collected from dark web and deep web sources using AI analysis.

**Features:**
- **PII Extraction** - Identify emails, credentials, and personal information mentions
- **Cryptocurrency Tracking** - Parse Bitcoin/Ethereum/Monero addresses with blockchain explorer links
- **Onion URL Cataloging** - Catalog .onion addresses found in evidence
- **Threat Intelligence** - AI cross-references mentions with known case entities

**Note:** This module does NOT access the dark web directly — it analyzes artifacts already collected by investigators.

### Module 5: Communications Analyzer

Analyze communication metadata from uploaded evidence.

**Features:**
- **Phone Number Intelligence** - Parse and validate phone numbers, identify country/carrier
- **Email Header Forensics** - Analyze routing paths, detect SPF/DKIM/DMARC spoofing indicators

---

## Legal Intelligence

### Legal Tab in Case Profile

Access legal research tools within case context.

### Case Law Panel

Browse and search case law precedents:
- Filter by jurisdiction
- Filter by verified status
- Search by keyword
- View key principles

**Precedent Details:**
- Case name and citation
- Court and year
- Summary
- Key principles
- Source URL
- Verification status

### Statute Browser

Browse legal statutes organized by framework:

**Frameworks:**
- Pakistani Criminal Law (PPC, PECA, CrPC)
- International Human Rights (UDHR, ICCPR, CAT)
- Regulatory (SECP, NADRA regulations)

### Doctrine Mapper

Map legal doctrines to case facts:
- Link relevant doctrines
- Add application notes
- Connect supporting evidence

### Appeal Summary Generator

Generate AI-powered appeal summaries:

1. Select summary type:
   - Habeas Corpus Petition
   - Criminal Appeal
   - Constitutional Petition
   - Application for Leave
2. Click **"Generate Summary"**
3. Review with Cite Check validation
4. Edit and finalize
5. Export for legal use

---

## Evidence Management

### Evidence Repository (`/evidence`)

Central location for all case documents.

### Uploading Evidence

1. Navigate to **Uploads** or **Evidence**
2. Click **"Upload Evidence"**
3. Select files (PDF, DOCX, images, etc.)
4. Add metadata:
   - Description
   - Category
   - Related case
   - Related events
5. Upload files

### Evidence Matrix

The Evidence Matrix shows how documents map to legal requirements:

| Framework | Requirement | Evidence Status |
|-----------|-------------|-----------------|
| CrPC | Section 103 - Search Witnesses | ✓ Documented |
| PECA | Section 33 - Electronic Evidence | ✗ Missing |
| ... | ... | ... |

### Linking Evidence to Claims

In the **Correlation** tab:
1. View legal claims from the case
2. Click **"Link Evidence"** on a claim
3. Select supporting documents or events
4. Add relevance notes
5. Assign exhibit numbers

---

## International Rights Analysis

### Rights Audit (`/international`)

Map case events to international human rights frameworks.

### Frameworks Analyzed

| Framework | Organization |
|-----------|--------------|
| UDHR | United Nations |
| ICCPR | United Nations |
| CAT | United Nations |
| CDHRI | Organization of Islamic Cooperation |
| ECHR | Council of Europe |
| EU Charter | European Union |

### Running Analysis

1. Navigate to **International Analysis**
2. Click **"Run Full Analysis"**
3. Review identified violations:
   - Violation category
   - Severity rating
   - Framework articles violated
   - Supporting evidence from case
   - Date range

### Framework Breakdown

View comparison of how different frameworks address the same violations:
- UN perspective
- OIC perspective
- EU perspective
- Convergence/divergence points

---

## Watchlist & Tracking

### Adding to Watchlist

From any detail page:
1. Click the **star icon** or **"Add to Watchlist"**
2. Item is saved to your personal watchlist

### Viewing Watchlist (`/watchlist`)

Access all tracked items organized by type:
- Events
- Entities
- Violations
- Cases

### Notifications

Receive alerts when tracked items are updated.

---

## Reports & Export

### Generating Reports

From the Investigation Hub:
1. Select **Report Generator**
2. Configure report options
3. Generate and download

### Export Formats

| Format | Use Case |
|--------|----------|
| Markdown | Documentation, GitHub |
| PDF | Legal submissions |
| CSV | Data analysis |
| JSON | API integration |

### Timeline Export

Export timeline as PDF with:
- Cover page
- Event cards
- Linked evidence references
- AI extraction indicators

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘/` / `Ctrl+/` | Focus search |
| `Esc` | Close modals/panels |
| `←` `→` | Navigate timeline |
| `+` `-` | Zoom network graph |

---

## Best Practices

### For Investigators

1. **Start with document upload** - Let AI extract initial intelligence
2. **Review and verify** - Check AI extractions for accuracy
3. **Build connections** - Link entities and evidence to claims
4. **Use the network** - Identify hidden relationships
5. **Generate reports** - Document findings formally

### For Legal Teams

1. **Verify precedents** - Check Cite Check indicators
2. **Link statutes** - Connect case facts to legal provisions
3. **Track compliance** - Monitor procedural requirements
4. **Generate summaries** - Use Appeal Summary Generator

### For Administrators

1. **Review audit logs** - Monitor data changes
2. **Manage users** - Assign appropriate roles
3. **Approve extractions** - Verify AI-extracted events
4. **Verify precedents** - Mark case law as verified

---

## Troubleshooting

### Common Issues

**Q: Documents not uploading?**
- Check file size (max 50MB)
- Ensure supported format (PDF, DOCX, images)

**Q: AI analysis failing?**
- Check rate limits
- Verify document contains readable text
- Try smaller document sections

**Q: Network graph not loading?**
- Clear browser cache
- Reduce visible entities with filters
- Check browser WebGL support

**Q: Events not appearing on timeline?**
- Check date format (YYYY-MM-DD required)
- Verify event is approved (if AI-extracted)
- Check visibility settings

---

## Getting Help

- **Contact Page:** [hrpm.lovable.app/contact](/contact)
- **About Page:** [hrpm.lovable.app/about](/about)
- **Tutorial Videos:** Available on the landing page

---

*Documenting injustice. Demanding accountability.*
