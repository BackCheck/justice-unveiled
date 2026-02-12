# HRPM.org - Justice Unveiled

![unnamed (21)](https://github.com/user-attachments/assets/654751e0-ab00-4c28-a591-7d3c202d638d)

## About HRPM.org

The **Human Rights Protection Movement (HRPM)** platform is a comprehensive investigative intelligence platform designed to document institutional failures and legal injustices. Through its AI-powered Investigation Hub, the system utilizes advanced algorithms to map complex relationships between entities, identify patterns of misconduct, and assess security risks.

### Key Features

- 🔍 **AI-Powered Document Analysis** - Automatically extract events, entities, and violations from legal documents
- 📊 **Interactive Timeline** - Chronological visualization of case events with evidence linking
- 🕸️ **Entity Network Graph** - D3-powered visualization of relationships between people and organizations
- ⚖️ **Legal Intelligence** - Comprehensive legal research tools with case law and statutes
- 🌍 **International Rights Analysis** - Map violations to UN, OIC, and EU human rights frameworks
- 📈 **Pattern Detection** - AI-powered identification of temporal and network patterns
- 💰 **Financial Harm Tracking** - Detailed economic impact documentation
- ✅ **Compliance Tracking** - Procedural compliance verification against legal frameworks

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL), Edge Functions (Deno)
- **AI**: Lovable AI Gateway (Google Gemini 1.5)
- **Visualization**: D3.js, Recharts
- **State**: TanStack React Query, React Context
- **Auth**: Supabase Auth (JWT-based)

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

### Quick Links

- 📖 [User Guide](./docs/USER_GUIDE.md) - How to use the platform
- 🛠️ [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Development setup
- 🏗️ [Architecture](./docs/ARCHITECTURE.md) - System design
- 🧪 [Testing Guide](./docs/TESTING_GUIDE.md) - Testing strategies
- 🚀 [Deployment](./docs/DEPLOYMENT.md) - Deployment procedures
- 🔒 [Security](./docs/SECURITY.md) - Security best practices
- ⚡ [Performance](./docs/PERFORMANCE.md) - Optimization guide
- 🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues

[View Full Documentation Index](./docs/README.md)

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## Project Structure

```
justice-unveiled/
├── docs/                     # Comprehensive documentation
├── public/                   # Static assets
├── src/
│   ├── components/           # React components (200+)
│   ├── pages/                # Route pages (23)
│   ├── hooks/                # Custom React hooks (23)
│   ├── lib/                  # Utility functions
│   ├── types/                # TypeScript definitions
│   ├── integrations/         # Supabase client
│   └── i18n/                 # Internationalization
├── supabase/
│   └── functions/            # Edge Functions (9)
├── package.json              # Dependencies
└── vite.config.ts            # Vite configuration
```

## Features Highlights

### AI-Powered Intelligence
- Automatic document analysis and extraction
- Threat profiling for adversarial entities
- Pattern detection across case data
- International rights violation mapping

### Data Visualization
- Interactive timeline with event filtering
- Force-directed entity relationship network
- Analytics dashboards with multiple chart types
- Parallel timeline reconstruction

### Legal Tools
- Case law precedent browser (CourtListener integration)
- Statute library with multi-framework support
- Appeal summary generator
- Evidence-to-claim correlation matrix

### Case Management
- Multi-case architecture with data isolation
- Evidence repository with file uploads
- Compliance tracking against legal frameworks
- Financial harm documentation

## Development

### Code Quality

```sh
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Testing
npm run test
npm run test:watch  # Watch mode
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for detailed contribution guidelines.

## Deployment

This application is deployed on Lovable Cloud with automatic deployments:

- **Production**: https://hrpm.lovable.app
- **Preview**: Auto-generated URLs for branches

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment procedures.

## Security

Security is a top priority. Key security measures:

- JWT-based authentication
- Row Level Security (RLS) on all tables
- Role-based access control (Admin, Analyst, Viewer)
- Encryption at rest and in transit
- Comprehensive audit logging
- Input validation on all forms

Report security vulnerabilities to security@hrpm.org

See [SECURITY.md](./docs/SECURITY.md) for detailed security practices.

## License

This platform is dedicated to human rights advocacy and legal accountability.

## Support

- **Documentation**: [/docs](./docs)
- **Website**: https://hrpm.lovable.app
- **Issues**: Report via GitHub Issues
- **Email**: support@hrpm.org

## Acknowledgments

Built with:
- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [Lovable Cloud](https://lovable.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

*Documenting injustice. Demanding accountability.*
