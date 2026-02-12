# HRPM.org State Management Guide

## Comprehensive Guide to State Management in the HRPM Platform

This document covers all aspects of state management including server state, client state, and data synchronization.

---

## Table of Contents

1. [Overview](#overview)
2. [State Architecture](#state-architecture)
3. [Server State (React Query)](#server-state-react-query)
4. [Client State (React Context)](#client-state-react-context)
5. [Custom Hooks](#custom-hooks)
6. [Real-Time Updates](#real-time-updates)
7. [Caching Strategy](#caching-strategy)
8. [Optimistic Updates](#optimistic-updates)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Overview

The HRPM platform uses a **three-tier state management architecture**:

1. **Server State** - Data from the backend (React Query)
2. **Global Client State** - App-wide UI state (React Context)
3. **Local Component State** - Component-specific state (useState/useReducer)

### State Management Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | 5.83.0 | Server state management |
| React Context | Built-in | Global UI state |
| useState/useReducer | Built-in | Local component state |

---

## State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Server State (React Query)                │ │
│  │                                                        │ │
│  │  • All backend data (cases, events, entities)         │ │
│  │  • Automatic caching and refetching                   │ │
│  │  • Request deduplication                              │ │
│  │  • Background updates                                 │ │
│  │                                                        │ │
│  │  Managed by: QueryClient                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Global Client State (React Context)          │ │
│  │                                                        │ │
│  │  • Authentication state (user, session)               │ │
│  │  • Theme preferences (light/dark)                     │ │
│  │  • UI state (sidebar collapsed)                       │ │
│  │  • Locale/language                                    │ │
│  │                                                        │ │
│  │  Managed by: AuthContext, ThemeProvider               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Local Component State (useState/useReducer)    │ │
│  │                                                        │ │
│  │  • Form inputs                                        │ │
│  │  • Modal/dialog visibility                            │ │
│  │  • Temporary selections                               │ │
│  │  • UI toggles and flags                               │ │
│  │                                                        │ │
│  │  Managed by: Individual components                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Server State (React Query)

### Query Client Configuration

**Location:** `src/main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes
      cacheTime: 10 * 60 * 1000,      // 10 minutes
      refetchOnWindowFocus: false,     // Don't refetch on window focus
      refetchOnReconnect: true,        // Refetch on reconnect
      retry: 3,                        // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,                        // Retry mutations once
    },
  },
});

// Wrap app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Basic Query Pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function Component() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["cases"],                // Unique cache key
    queryFn: async () => {              // Fetch function
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,          // Override default
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Query with Parameters

```tsx
const { data } = useQuery({
  queryKey: ["case", caseId],           // Include params in key
  queryFn: async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();
    
    if (error) throw error;
    return data;
  },
  enabled: !!caseId,                    // Only run if caseId exists
});
```

### Dependent Queries

```tsx
// First query
const { data: case } = useQuery({
  queryKey: ["case", caseId],
  queryFn: () => fetchCase(caseId),
  enabled: !!caseId,
});

// Second query depends on first
const { data: events } = useQuery({
  queryKey: ["events", case?.id],
  queryFn: () => fetchEvents(case.id),
  enabled: !!case?.id,                  // Only run if case exists
});
```

### Parallel Queries

```tsx
function Component() {
  const casesQuery = useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });

  const entitiesQuery = useQuery({
    queryKey: ["entities"],
    queryFn: fetchEntities,
  });

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // All queries run in parallel
  if (casesQuery.isLoading || entitiesQuery.isLoading || eventsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{/* Use all data */}</div>;
}
```

### Infinite Queries (Pagination)

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["events"],
  queryFn: async ({ pageParam = 0 }) => {
    const { data, error } = await supabase
      .from("extracted_events")
      .select("*")
      .range(pageParam * 20, (pageParam + 1) * 20 - 1)
      .order("date", { ascending: false });
    
    if (error) throw error;
    return data;
  },
  getNextPageParam: (lastPage, pages) => {
    return lastPage.length === 20 ? pages.length : undefined;
  },
});

// Access data
const allEvents = data?.pages.flat() ?? [];
```

### Mutations

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function Component() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newCase: NewCase) => {
      const { data, error } = await supabase
        .from("cases")
        .insert(newCase)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      
      // Show success toast
      toast.success("Case created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create case: ${error.message}`);
    },
  });

  const handleSubmit = (formData: NewCase) => {
    mutation.mutate(formData);
  };

  return (
    <Button 
      onClick={() => handleSubmit(data)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create Case"}
    </Button>
  );
}
```

### Update Mutations

```tsx
const updateMutation = useMutation({
  mutationFn: async ({ id, updates }: { id: string; updates: Partial<Case> }) => {
    const { error } = await supabase
      .from("cases")
      .update(updates)
      .eq("id", id);
    
    if (error) throw error;
  },
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ["case", variables.id] });
    queryClient.invalidateQueries({ queryKey: ["cases"] });
  },
});
```

### Delete Mutations

```tsx
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["cases"] });
    toast.success("Case deleted");
  },
});
```

---

## Client State (React Context)

### AuthContext

**Location:** `src/contexts/AuthContext.tsx`

Manages authentication state globally.

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Usage:**

```tsx
function Component() {
  const { user, session, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
}
```

### Theme Context (via next-themes)

```tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

**Usage:**

```tsx
import { useTheme } from "next-themes";

function Component() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </Button>
  );
}
```

---

## Custom Hooks

### Data Fetching Hooks

#### useCases
**Location:** `src/hooks/useCases.ts`

```tsx
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

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCase: NewCase) => {
      const { data, error } = await supabase
        .from("cases")
        .insert(newCase)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
};
```

#### useExtractedEvents
**Location:** `src/hooks/useExtractedEvents.ts`

```tsx
export const useExtractedEvents = (caseId?: string) => {
  return useQuery({
    queryKey: ["extracted-events", caseId],
    queryFn: async () => {
      let query = supabase
        .from("extracted_events")
        .select("*")
        .order("date", { ascending: false });

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useAnalyzeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AnalyzeDocumentParams) => {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
      queryClient.invalidateQueries({ queryKey: ["extracted-entities"] });
    },
  });
};
```

### Combined Data Hooks

#### useCombinedTimeline
**Location:** `src/hooks/useCombinedTimeline.ts`

Merges data from multiple sources.

```tsx
export const useCombinedTimeline = (caseId?: string) => {
  const { data: extractedEvents } = useExtractedEvents(caseId);
  const { data: staticEvents } = useStaticEvents();

  return useMemo(() => {
    const combined = [...(extractedEvents ?? []), ...(staticEvents ?? [])];
    return combined.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [extractedEvents, staticEvents]);
};
```

---

## Real-Time Updates

### Realtime Subscriptions

```tsx
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function Component() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to changes
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",                    // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "extracted_events",
        },
        (payload) => {
          console.log("Change received:", payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ["extracted-events"] });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Component rendering...
}
```

### Specific Event Subscriptions

```tsx
// Listen only to INSERTs
.on("postgres_changes", {
  event: "INSERT",
  schema: "public",
  table: "cases",
}, (payload) => {
  // Handle new case
})

// Listen only to UPDATEs
.on("postgres_changes", {
  event: "UPDATE",
  schema: "public",
  table: "cases",
}, (payload) => {
  // Handle case update
})

// Listen only to DELETEs
.on("postgres_changes", {
  event: "DELETE",
  schema: "public",
  table: "cases",
}, (payload) => {
  // Handle case deletion
})
```

---

## Caching Strategy

### Cache Keys

**Naming Convention:**

```tsx
// Single resource
["case", caseId]
["entity", entityId]
["event", eventId]

// List of resources
["cases"]
["entities"]
["events"]

// Filtered lists
["events", caseId]
["entities", { type: "Person" }]

// Computed data
["graph-data", caseId]
["timeline-data", caseId]
```

### Manual Cache Updates

```tsx
const queryClient = useQueryClient();

// Set query data directly
queryClient.setQueryData(["case", caseId], newData);

// Get query data
const caseData = queryClient.getQueryData(["case", caseId]);

// Invalidate (mark as stale)
queryClient.invalidateQueries({ queryKey: ["cases"] });

// Refetch immediately
queryClient.refetchQueries({ queryKey: ["case", caseId] });

// Remove from cache
queryClient.removeQueries({ queryKey: ["case", caseId] });
```

### Prefetching

```tsx
// Prefetch on hover
const handleHover = async (caseId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ["case", caseId],
    queryFn: () => fetchCase(caseId),
  });
};

<Link 
  to={`/cases/${case.id}`}
  onMouseEnter={() => handleHover(case.id)}
>
  {case.title}
</Link>
```

---

## Optimistic Updates

### Optimistic Create

```tsx
const createMutation = useMutation({
  mutationFn: createCase,
  onMutate: async (newCase) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["cases"] });

    // Snapshot previous value
    const previousCases = queryClient.getQueryData(["cases"]);

    // Optimistically update
    queryClient.setQueryData(["cases"], (old: Case[]) => [
      ...old,
      { ...newCase, id: "temp-id", created_at: new Date().toISOString() },
    ]);

    // Return context with snapshot
    return { previousCases };
  },
  onError: (err, newCase, context) => {
    // Rollback on error
    queryClient.setQueryData(["cases"], context.previousCases);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["cases"] });
  },
});
```

### Optimistic Update

```tsx
const updateMutation = useMutation({
  mutationFn: updateCase,
  onMutate: async ({ id, updates }) => {
    await queryClient.cancelQueries({ queryKey: ["case", id] });

    const previousCase = queryClient.getQueryData(["case", id]);

    queryClient.setQueryData(["case", id], (old: Case) => ({
      ...old,
      ...updates,
    }));

    return { previousCase };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(["case", variables.id], context.previousCase);
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({ queryKey: ["case", variables.id] });
  },
});
```

---

## Error Handling

### Global Error Boundary

```tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

### Query Error Handling

```tsx
const { data, error, isError } = useQuery({
  queryKey: ["cases"],
  queryFn: fetchCases,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorDisplay error={error} />;
}
```

### Mutation Error Handling

```tsx
const mutation = useMutation({
  mutationFn: createCase,
  onError: (error) => {
    if (error instanceof Error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred");
    }
  },
});
```

---

## Best Practices

### 1. Use Consistent Query Keys

```tsx
// ✅ Good - Hierarchical structure
["cases"]
["case", caseId]
["case", caseId, "events"]
["case", caseId, "entities"]

// ❌ Bad - Inconsistent naming
["allCases"]
["getCaseById", caseId]
["events_for_case", caseId]
```

### 2. Enable Queries Conditionally

```tsx
// ✅ Good - Only fetch when needed
const { data } = useQuery({
  queryKey: ["case", caseId],
  queryFn: () => fetchCase(caseId),
  enabled: !!caseId,
});

// ❌ Bad - Always runs
const { data } = useQuery({
  queryKey: ["case", caseId],
  queryFn: () => caseId ? fetchCase(caseId) : null,
});
```

### 3. Invalidate Related Queries

```tsx
// ✅ Good - Invalidate all related queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["cases"] });
  queryClient.invalidateQueries({ queryKey: ["case", id] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

// ❌ Bad - Only invalidate one
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["cases"] });
}
```

### 4. Handle Loading States

```tsx
// ✅ Good - Clear loading indication
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### 5. Use Custom Hooks

```tsx
// ✅ Good - Reusable logic
function Component() {
  const { data, isLoading } = useCases();
  // ...
}

// ❌ Bad - Duplicate query logic
function Component() {
  const { data, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });
  // ...
}
```

### 6. Separate Concerns

```tsx
// ✅ Good - Data hook + presentation component
const CasesContainer = () => {
  const { data, isLoading } = useCases();
  return <CasesList cases={data} loading={isLoading} />;
};

// ❌ Bad - Mixed concerns
const CasesList = () => {
  const { data, isLoading } = useCases();
  return <div>{/* render */}</div>;
};
```

---

*For more examples, see the custom hooks in `src/hooks/`.*
