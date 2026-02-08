# HRPM.org Documentation

## Human Rights Protection Movement - Investigative Intelligence Platform

**Version:** 2.0  
**Last Updated:** February 2026  
**Status:** Production

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

HRPM.org (Human Rights Protection Movement) is a comprehensive investigative intelligence platform designed to:

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
