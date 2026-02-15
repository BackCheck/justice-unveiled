# HRPM.org Performance Optimization Guide

## Comprehensive Performance Best Practices

This guide covers performance optimization strategies for the HRPM platform, from frontend to backend.

---

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Frontend Performance](#frontend-performance)
3. [Backend Performance](#backend-performance)
4. [Database Optimization](#database-optimization)
5. [Network Optimization](#network-optimization)
6. [Caching Strategies](#caching-strategies)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Performance Checklist](#performance-checklist)

---

## Performance Overview

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint (FCP)** | < 1.8s | Monitor |
| **Largest Contentful Paint (LCP)** | < 2.5s | Monitor |
| **Time to Interactive (TTI)** | < 3.8s | Monitor |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Monitor |
| **First Input Delay (FID)** | < 100ms | Monitor |
| **Bundle Size (gzipped)** | < 500KB | Monitor |
| **API Response Time** | < 500ms | Monitor |
| **Database Query Time** | < 100ms | Monitor |

### Performance Measurement Tools

- **Lighthouse** - Overall performance score
- **Chrome DevTools** - Network, Performance tabs
- **React DevTools Profiler** - Component render times
- **Supabase Dashboard** - Query performance
- **Web Vitals** - Core Web Vitals tracking

---

## Frontend Performance

### Code Splitting

**Route-Based Code Splitting:**

```tsx
import { lazy, Suspense } from "react";

// ✅ Good - Lazy load routes
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cases = lazy(() => import("./pages/Cases"));
const Admin = lazy(() => import("./pages/Admin"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}

// ❌ Bad - Import all routes upfront
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Admin from "./pages/Admin";
```

**Component-Based Code Splitting:**

```tsx
// ✅ Good - Lazy load heavy components
const HeavyChart = lazy(() => import("./components/HeavyChart"));
const D3Network = lazy(() => import("./components/D3Network"));

function Dashboard() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <HeavyChart />
        <D3Network />
      </Suspense>
    </div>
  );
}
```

**Dynamic Imports:**

```tsx
// ✅ Good - Import on demand
async function exportToPDF() {
  const { generatePDF } = await import("./utils/pdfGenerator");
  await generatePDF(data);
}
```

### React Optimization

**Memoization:**

```tsx
import { useMemo, useCallback, memo } from "react";

// ✅ Good - Memoize expensive calculations
function Component({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  return <div>{/* render */}</div>;
}

// ✅ Good - Memo component
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render expensive component */}</div>;
});
```

**Avoid Unnecessary Re-renders:**

```tsx
// ✅ Good - Stable key
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ Bad - Index as key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ Good - Prevent re-renders
const Component = memo(({ value }) => {
  return <div>{value}</div>;
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});
```

**Virtual Scrolling:**

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function LongList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Bundle Optimization

**Analyze Bundle:**

```bash
npm run build -- --mode analyze
```

**Vite Bundle Optimization:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
          query: ["@tanstack/react-query"],
          charts: ["recharts", "d3-force"],
        },
      },
    },
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
      },
    },
  },
});
```

**Tree Shaking:**

```tsx
// ✅ Good - Named imports
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// ❌ Bad - Default import of entire library
import * as RadixUI from "@radix-ui/react-dialog";
```

### Asset Optimization

**Image Optimization:**

```tsx
// ✅ Good - Responsive images with lazy loading
<img
  src="/images/hero.webp"
  srcSet="/images/hero-320w.webp 320w,
          /images/hero-640w.webp 640w,
          /images/hero-1280w.webp 1280w"
  sizes="(max-width: 320px) 280px,
         (max-width: 640px) 600px,
         1200px"
  loading="lazy"
  alt="Hero image"
/>

// ✅ Good - Use WebP format
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

**Font Optimization:**

```css
/* ✅ Good - Subset fonts, use font-display */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-subset.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
  unicode-range: U+0020-007E; /* Latin subset */
}
```

**Icon Optimization:**

```tsx
// ✅ Good - Use icon library with tree shaking
import { Home, Settings, User } from "lucide-react";

// ❌ Bad - Import entire icon library
import * as Icons from "lucide-react";
```

---

## Backend Performance

### Edge Function Optimization

**Minimize Cold Starts:**

```typescript
// ✅ Good - Keep functions warm
// Shared initialization outside handler
const client = createClient();

export default async function handler(req: Request) {
  // Use pre-initialized client
  const result = await client.query();
  return new Response(JSON.stringify(result));
}

// ❌ Bad - Initialize in handler
export default async function handler(req: Request) {
  const client = createClient();  // Cold start penalty
  const result = await client.query();
  return new Response(JSON.stringify(result));
}
```

**Batch Operations:**

```typescript
// ✅ Good - Batch database inserts
const { data, error } = await supabase
  .from("extracted_events")
  .insert(eventsArray);  // Insert all at once

// ❌ Bad - Individual inserts
for (const event of events) {
  await supabase.from("extracted_events").insert(event);
}
```

**Optimize AI Prompts:**

```typescript
// ✅ Good - Concise prompts
const prompt = `Extract events from: ${text.substring(0, 5000)}`;

// ❌ Bad - Excessive context
const prompt = `
  Please carefully analyze this document...
  [Long instructions]
  Document: ${entireDocument}
`;
```

### API Response Optimization

**Compression:**

```typescript
// Enable gzip compression in Edge Functions
return new Response(JSON.stringify(data), {
  headers: {
    "Content-Type": "application/json",
    "Content-Encoding": "gzip",
  },
});
```

**Pagination:**

```typescript
// ✅ Good - Paginate large datasets
const { data, error } = await supabase
  .from("extracted_events")
  .select("*")
  .range(page * 20, (page + 1) * 20 - 1);

// ❌ Bad - Fetch all records
const { data, error } = await supabase
  .from("extracted_events")
  .select("*");
```

**Selective Field Fetching:**

```typescript
// ✅ Good - Select only needed fields
const { data } = await supabase
  .from("cases")
  .select("id, title, status");

// ❌ Bad - Select all fields
const { data } = await supabase
  .from("cases")
  .select("*");
```

---

## Database Optimization

### Indexing Strategy

**Add Indexes for Common Queries:**

```sql
-- Index for date filtering
CREATE INDEX idx_events_date ON extracted_events(date);

-- Index for case lookups
CREATE INDEX idx_events_case_id ON extracted_events(case_id);

-- Composite index for common query
CREATE INDEX idx_events_case_date 
ON extracted_events(case_id, date DESC);

-- Index for text search
CREATE INDEX idx_cases_title_gin 
ON cases USING gin(to_tsvector('english', title));
```

**Monitor Index Usage:**

```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Identify missing indexes
SELECT 
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';
```

### Query Optimization

**Use EXPLAIN ANALYZE:**

```sql
EXPLAIN ANALYZE
SELECT e.*, c.title
FROM extracted_events e
JOIN cases c ON e.case_id = c.id
WHERE e.date > '2024-01-01'
ORDER BY e.date DESC
LIMIT 20;
```

**Optimize JOINs:**

```sql
-- ✅ Good - Indexed JOIN
SELECT e.*, c.title
FROM extracted_events e
INNER JOIN cases c ON e.case_id = c.id
WHERE c.status = 'active';

-- ❌ Bad - Unfiltered JOIN
SELECT *
FROM extracted_events e
CROSS JOIN cases c;
```

**Use Database Functions:**

```sql
-- ✅ Good - Single database call
CREATE FUNCTION get_case_summary(p_case_id UUID)
RETURNS TABLE (
  case_title TEXT,
  event_count BIGINT,
  entity_count BIGINT
) AS $$
  SELECT 
    c.title,
    (SELECT COUNT(*) FROM extracted_events WHERE case_id = p_case_id),
    (SELECT COUNT(*) FROM extracted_entities WHERE case_id = p_case_id)
  FROM cases c
  WHERE c.id = p_case_id;
$$ LANGUAGE sql STABLE;

-- Call from client
const { data } = await supabase.rpc("get_case_summary", {
  p_case_id: caseId,
});
```

---

## Network Optimization

### Reduce Request Count

**Combine API Calls:**

```typescript
// ✅ Good - Single query with joins
const { data } = await supabase
  .from("cases")
  .select(`
    *,
    extracted_events(*),
    extracted_entities(*)
  `)
  .eq("id", caseId)
  .single();

// ❌ Bad - Multiple sequential queries
const { data: case } = await supabase
  .from("cases")
  .select("*")
  .eq("id", caseId)
  .single();

const { data: events } = await supabase
  .from("extracted_events")
  .select("*")
  .eq("case_id", caseId);

const { data: entities } = await supabase
  .from("extracted_entities")
  .select("*")
  .eq("case_id", caseId);
```

**Parallel Requests:**

```typescript
// ✅ Good - Parallel requests
const [casesData, entitiesData, eventsData] = await Promise.all([
  supabase.from("cases").select("*"),
  supabase.from("extracted_entities").select("*"),
  supabase.from("extracted_events").select("*"),
]);

// ❌ Bad - Sequential requests
const cases = await supabase.from("cases").select("*");
const entities = await supabase.from("extracted_entities").select("*");
const events = await supabase.from("extracted_events").select("*");
```

### HTTP/2 & CDN

- Lovable Cloud automatically uses HTTP/2
- Assets served from CDN
- Connection multiplexing enabled
- No manual configuration needed

---

## Caching Strategies

### React Query Caching

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Different staleTime for different data
const { data: staticData } = useQuery({
  queryKey: ["static-data"],
  queryFn: fetchStaticData,
  staleTime: Infinity,  // Never goes stale
});

const { data: liveData } = useQuery({
  queryKey: ["live-data"],
  queryFn: fetchLiveData,
  staleTime: 0,  // Always fresh
});
```

### Browser Caching

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Content-based hashing for caching
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
});
```

### Database Query Caching

```typescript
// Use Supabase cached queries
const { data } = await supabase
  .from("legal_statutes")
  .select("*")
  .single();
// Supabase caches identical queries automatically
```

---

## Monitoring & Metrics

### Frontend Monitoring

**Web Vitals Tracking:**

```tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**React Profiler:**

```tsx
import { Profiler } from "react";

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### Backend Monitoring

**Edge Function Metrics:**

```typescript
// Log execution time
const start = Date.now();

// Function logic...

const duration = Date.now() - start;
console.log(`Function executed in ${duration}ms`);
```

**Database Query Monitoring:**

```sql
-- Check slow queries
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Performance Budget

Set performance budgets in build:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Limit chunk sizes
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,  // Warn if chunk > 500KB
  },
});
```

---

## Performance Checklist

### Frontend

- [ ] Code split routes with React.lazy()
- [ ] Memoize expensive calculations with useMemo()
- [ ] Use useCallback for callback functions
- [ ] Implement virtual scrolling for long lists
- [ ] Lazy load images with loading="lazy"
- [ ] Use WebP image format
- [ ] Minimize bundle size (< 500KB gzipped)
- [ ] Tree shake unused code
- [ ] Remove console.log in production
- [ ] Implement error boundaries
- [ ] Use React DevTools Profiler

### Backend

- [ ] Add database indexes for common queries
- [ ] Use selective field fetching
- [ ] Implement pagination for large datasets
- [ ] Batch database operations
- [ ] Optimize Edge Function cold starts
- [ ] Minimize AI prompt sizes
- [ ] Use database functions for complex queries
- [ ] Enable compression
- [ ] Monitor query performance

### Caching

- [ ] Configure React Query staleTime
- [ ] Use browser caching with hashed filenames
- [ ] Cache API responses appropriately
- [ ] Prefetch data on user interactions

### Monitoring

- [ ] Track Core Web Vitals
- [ ] Monitor bundle sizes
- [ ] Check database query times
- [ ] Review Edge Function logs
- [ ] Set up performance budgets
- [ ] Run Lighthouse audits regularly

---

*Regular performance audits should be conducted to maintain optimal user experience.*
