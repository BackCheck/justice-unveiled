# HRPM.org Developer Guide

## Contributing to the Human Rights Protection & Monitoring Platform

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Development Setup](#development-setup)
4. [Architecture Patterns](#architecture-patterns)
5. [Component Guidelines](#component-guidelines)
6. [State Management](#state-management)
7. [Backend Integration](#backend-integration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Project Structure

```
hrpm.org/
├── docs/                          # Documentation
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   └── DEVELOPER_GUIDE.md
│
├── public/                        # Static assets
│   ├── favicon.ico
│   ├── og-image.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── assets/                    # Dynamic assets (imported)
│   │   ├── hrpm-logo.png
│   │   └── human-rights-logo.svg
│   │
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Layout components
│   │   ├── landing/               # Landing page components
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── network/               # Network graph components
│   │   ├── timeline/              # Timeline components
│   │   ├── evidence/              # Evidence management
│   │   ├── investigations/        # Investigation hub
│   │   ├── legal-intelligence/    # Legal research tools
│   │   ├── compliance/            # Compliance tracking
│   │   ├── correlation/           # Claim-evidence correlation
│   │   ├── reconstruction/        # Timeline reconstruction
│   │   ├── regulatory-harm/       # Financial harm tracking
│   │   ├── international/         # International rights
│   │   ├── intel/                 # AI intelligence
│   │   ├── admin/                 # Admin panel
│   │   ├── detail/                # Detail page components
│   │   ├── sharing/               # Social sharing
│   │   └── export/                # PDF/Report export
│   │
│   ├── contexts/                  # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── data/                      # Static data files
│   │   ├── timelineData.ts
│   │   ├── entitiesData.ts
│   │   ├── violationsData.ts
│   │   └── sourcesData.ts
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useExtractedEvents.ts
│   │   ├── useCases.ts
│   │   ├── useGraphData.ts
│   │   ├── useLegalIntelligence.ts
│   │   └── ...
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.json
│   │       ├── ur.json
│   │       ├── ar.json
│   │       └── zh.json
│   │
│   ├── integrations/              # External integrations
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client (auto-generated)
│   │       └── types.ts           # Database types (auto-generated)
│   │
│   ├── lib/                       # Utility libraries
│   │   └── utils.ts
│   │
│   ├── pages/                     # Route pages
│   │   ├── Index.tsx
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Network.tsx
│   │   ├── CaseProfile.tsx
│   │   └── ...
│   │
│   ├── types/                     # TypeScript types
│   │   ├── compliance.ts
│   │   ├── correlation.ts
│   │   ├── reconstruction.ts
│   │   └── ...
│   │
│   ├── App.tsx                    # Main app component
│   ├── App.css                    # Global styles
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind CSS
│
├── supabase/
│   ├── config.toml                # Supabase config
│   └── functions/                 # Edge functions
│       ├── analyze-document/
│       ├── intel-chat/
│       ├── threat-profiler/
│       ├── pattern-detector/
│       ├── generate-report/
│       ├── analyze-rights-violations/
│       ├── generate-appeal-summary/
│       ├── fetch-news/
│       └── fetch-legal-precedents/
│
├── tailwind.config.ts             # Tailwind configuration
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TailwindCSS** | Utility-first CSS |
| **shadcn/ui** | Component library |
| **React Router** | Client-side routing |
| **React Query** | Server state management |
| **Recharts** | Charts and graphs |
| **D3.js** | Network visualization |
| **Framer Motion** | Animations |
| **i18next** | Internationalization |

### Backend

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Database |
| **Edge Functions** | Serverless API |
| **Lovable AI Gateway** | AI model access |
| **Row Level Security** | Data protection |

### External Services

| Service | Purpose |
|---------|---------|
| **CourtListener API** | Legal precedents |
| **News API** | News aggregation |
| **Lovable AI** | AI analysis (Gemini) |

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or bun
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hrpm.org

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The `.env` file is auto-generated with Supabase credentials:

```env
VITE_SUPABASE_URL=https://ccdyqmjvzzoftzbzbqlu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key>
VITE_SUPABASE_PROJECT_ID=ccdyqmjvzzoftzbzbqlu
```

**Do not edit this file manually.**

---

## Architecture Patterns

### Component Architecture

Components follow a modular architecture:

```
components/
├── ui/                    # Primitive UI components (shadcn)
├── layout/                # App-wide layout components
├── [feature]/             # Feature-specific components
│   ├── FeatureMain.tsx    # Main feature component
│   ├── FeatureWidget.tsx  # Sub-components
│   └── index.ts           # Barrel export
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Supabase  │◄───►│ React Query │◄───►│   React     │
│  Database   │     │   Hooks     │     │ Components  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Context   │
                    │  (Auth, UI) │
                    └─────────────┘
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EntityNetwork.tsx` |
| Hooks | camelCase with `use` prefix | `useExtractedEvents.ts` |
| Types | PascalCase | `types/compliance.ts` |
| Utils | camelCase | `lib/utils.ts` |
| Pages | PascalCase | `pages/Dashboard.tsx` |

---

## Component Guidelines

### Component Structure

```tsx
// Standard component template
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ComponentProps {
  caseId: string;
  onUpdate?: (data: DataType) => void;
}

export function ComponentName({ caseId, onUpdate }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialState);

  const { data, isLoading, error } = useQuery({
    queryKey: ["query-key", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table")
        .select("*")
        .eq("case_id", caseId);
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}
```

### shadcn/ui Usage

```tsx
// Use semantic design tokens
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Dangerous Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>

// Use consistent spacing
<Card className="p-6 space-y-4">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Styling Guidelines

1. **Use Tailwind classes** - Avoid inline styles
2. **Use design tokens** - Reference CSS variables from `index.css`
3. **Use semantic colors** - `text-foreground`, `bg-background`, etc.
4. **Responsive first** - Mobile-first responsive design
5. **Dark mode support** - Use theme-aware classes

```tsx
// ✅ Good
<div className="bg-card text-card-foreground rounded-lg p-4">

// ❌ Bad
<div style={{ backgroundColor: '#fff', color: '#000' }}>
```

---

## State Management

### Server State (React Query)

Use React Query for all server data:

```tsx
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ["cases"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cases").select("*");
    if (error) throw error;
    return data;
  },
});

// Mutations
const mutation = useMutation({
  mutationFn: async (newCase: NewCase) => {
    const { data, error } = await supabase.from("cases").insert(newCase);
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["cases"] });
    toast.success("Case created");
  },
});
```

### Client State

- **useState** for component-local state
- **Context** for global UI state (auth, theme, sidebar)
- **URL params** for shareable state

### Custom Hooks

Create custom hooks for reusable data logic:

```tsx
// hooks/useCases.ts
export const useCases = () => {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Case[];
    },
  });
};

export const useCase = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();
      if (error) throw error;
      return data as Case;
    },
    enabled: !!caseId,
  });
};
```

---

## Backend Integration

### Supabase Client

```tsx
import { supabase } from "@/integrations/supabase/client";

// Query
const { data, error } = await supabase
  .from("table")
  .select("*")
  .eq("column", value);

// Insert
const { data, error } = await supabase
  .from("table")
  .insert({ column: value })
  .select()
  .single();

// Update
const { error } = await supabase
  .from("table")
  .update({ column: newValue })
  .eq("id", id);

// Delete
const { error } = await supabase
  .from("table")
  .delete()
  .eq("id", id);
```

### Edge Functions

```tsx
// Invoke edge function
const { data, error } = await supabase.functions.invoke("function-name", {
  body: { param1: value1, param2: value2 },
});

// With streaming
const response = await supabase.functions.invoke("intel-chat", {
  body: { messages },
});

const reader = response.data.getReader();
// Process SSE stream
```

### Realtime Subscriptions

```tsx
useEffect(() => {
  const channel = supabase
    .channel("events-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "extracted_events",
      },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [queryClient]);
```

---

## Testing

### Unit Tests

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch
```

### Test Structure

```tsx
// src/test/example.test.ts
import { describe, it, expect } from "vitest";

describe("utility function", () => {
  it("should return expected result", () => {
    expect(utilityFunction(input)).toBe(expectedOutput);
  });
});
```

### Edge Function Tests

```bash
# Test edge functions
npx supabase functions test function-name
```

---

## Deployment

### Build

```bash
# Production build
npm run build
```

### Preview

```bash
# Preview production build
npm run preview
```

### Lovable Deployment

1. Click **Publish** in Lovable interface
2. Click **Update** to deploy frontend changes
3. Edge functions deploy automatically on save

---

## Contributing Guidelines

### Branch Strategy

```
main          # Production
├── develop   # Development
│   ├── feature/feature-name
│   ├── fix/bug-description
│   └── docs/documentation-update
```

### Commit Messages

Use conventional commits:

```
feat: add threat profiler module
fix: resolve timeline date parsing issue
docs: update API reference
refactor: simplify entity network rendering
style: format code with prettier
test: add unit tests for useCases hook
```

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Responsive design is maintained
- [ ] Accessibility is considered
- [ ] Tests are included/updated
- [ ] Documentation is updated

---

## Best Practices

### Performance

1. **Memoize expensive calculations** with `useMemo`
2. **Virtualize long lists** with `react-virtual`
3. **Lazy load routes** with `React.lazy`
4. **Optimize images** with proper formats and sizes
5. **Debounce search inputs**

### Security

1. **Never expose secrets** in client code
2. **Validate input** on both client and server
3. **Use RLS policies** for data access control
4. **Sanitize user content** before rendering
5. **Use HTTPS** for all external requests

### Accessibility

1. **Use semantic HTML** elements
2. **Add ARIA labels** where needed
3. **Ensure keyboard navigation**
4. **Maintain color contrast**
5. **Test with screen readers**

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query)
- [D3.js Documentation](https://d3js.org)

---

*Documenting injustice. Demanding accountability.*
