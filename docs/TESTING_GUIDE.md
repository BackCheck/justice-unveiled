# HRPM.org Testing Guide

## Comprehensive Testing Documentation

This guide covers testing strategies, patterns, and examples for the HRPM platform.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Stack](#testing-stack)
3. [Unit Testing](#unit-testing)
4. [Component Testing](#component-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing](#e2e-testing)
7. [Testing Best Practices](#testing-best-practices)
8. [Running Tests](#running-tests)
9. [Coverage](#coverage)
10. [CI/CD Integration](#cicd-integration)

---

## Testing Overview

### Testing Philosophy

The HRPM platform follows a **testing pyramid** approach:

```
          ┌───────────────┐
          │   E2E Tests   │  ← Few, test critical user flows
          │   (Future)    │
          └───────────────┘
        ┌─────────────────────┐
        │ Integration Tests    │  ← Some, test feature modules
        │   (React Query)      │
        └─────────────────────┘
    ┌───────────────────────────────┐
    │      Unit Tests               │  ← Many, test individual functions
    │   (Utils, Hooks, Logic)       │
    └───────────────────────────────┘
```

### Test Types

| Test Type | Coverage | Speed | Cost |
|-----------|----------|-------|------|
| Unit | Individual functions | Fast | Low |
| Component | React components | Medium | Medium |
| Integration | Feature modules | Slow | High |
| E2E | User workflows | Very Slow | Very High |

---

## Testing Stack

### Core Libraries

```json
{
  "devDependencies": {
    "vitest": "^3.2.4",                      // Test runner
    "@testing-library/react": "^16.0.0",     // React testing utilities
    "@testing-library/jest-dom": "^6.6.0",   // DOM matchers
    "jsdom": "^20.0.3"                       // DOM environment
  }
}
```

### Configuration Files

#### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "*.config.ts",
        "src/main.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### Test Setup File

**Location:** `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));
```

---

## Unit Testing

### Testing Utility Functions

**Example:** Testing a date formatter

```typescript
// src/lib/dateUtils.ts
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
```

```typescript
// src/test/lib/dateUtils.test.ts
import { describe, it, expect } from "vitest";
import { formatDate, isValidDate } from "@/lib/dateUtils";

describe("dateUtils", () => {
  describe("formatDate", () => {
    it("should format date string correctly", () => {
      expect(formatDate("2024-01-15")).toBe("January 15, 2024");
    });

    it("should handle Date object", () => {
      const date = new Date("2024-01-15");
      expect(formatDate(date)).toBe("January 15, 2024");
    });

    it("should handle invalid date gracefully", () => {
      expect(formatDate("invalid")).toBe("Invalid Date");
    });
  });

  describe("isValidDate", () => {
    it("should return true for valid date string", () => {
      expect(isValidDate("2024-01-15")).toBe(true);
    });

    it("should return false for invalid date string", () => {
      expect(isValidDate("not-a-date")).toBe(false);
    });

    it("should return true for ISO date format", () => {
      expect(isValidDate("2024-01-15T10:30:00Z")).toBe(true);
    });
  });
});
```

### Testing Custom Hooks

**Example:** Testing a data fetching hook

```typescript
// src/hooks/useCases.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCases } from "@/hooks/useCases";

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper for hooks that need QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useCases", () => {
  it("should fetch cases successfully", async () => {
    // Mock the Supabase response
    const mockCases = [
      { id: "1", title: "Case 1", status: "active" },
      { id: "2", title: "Case 2", status: "closed" },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockCases,
          error: null,
        }),
      }),
    } as any);

    // Render hook
    const { result } = renderHook(() => useCases(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check data
    expect(result.current.data).toEqual(mockCases);
    expect(result.current.error).toBe(null);
  });

  it("should handle error", async () => {
    // Mock error response
    const mockError = new Error("Failed to fetch cases");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCases(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

---

## Component Testing

### Testing Simple Components

**Example:** Testing a Button component

```typescript
// src/components/ui/button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should render destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });
});
```

### Testing Form Components

```typescript
// src/components/forms/CaseForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CaseForm } from "@/components/forms/CaseForm";

describe("CaseForm", () => {
  it("should render all form fields", () => {
    render(<CaseForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/case number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const handleSubmit = vi.fn();
    render(<CaseForm onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/case number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("should submit form with valid data", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<CaseForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/case number/i), "CF-001");
    await user.type(screen.getByLabelText(/title/i), "Test Case");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    
    await user.click(screen.getByRole("button", { name: /submit/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        caseNumber: "CF-001",
        title: "Test Case",
        description: "Test description",
        status: "active",
      });
    });
  });
});
```

### Testing Components with Context

```typescript
// src/components/layout/Header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  user_metadata: {},
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          session: { user: mockUser } as any,
          loading: false,
          signOut: vi.fn(),
        }}
      >
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe("Header", () => {
  it("should display user email when authenticated", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("should show sign out button", () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
```

### Testing Components with Mock Data

```typescript
// src/components/timeline/InteractiveTimeline.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InteractiveTimeline } from "@/components/timeline/InteractiveTimeline";

// Mock the custom hook
vi.mock("@/hooks/useCombinedTimeline", () => ({
  useCombinedTimeline: () => [
    {
      id: "1",
      date: "2024-01-15",
      category: "Legal Proceeding",
      description: "Event 1",
      individuals: "Person A",
      legalAction: "Action 1",
      outcome: "Outcome 1",
      evidenceDiscrepancy: "None",
      sources: "Source 1",
      confidenceScore: 0.95,
    },
    {
      id: "2",
      date: "2024-01-20",
      category: "Business Interference",
      description: "Event 2",
      individuals: "Person B",
      legalAction: "Action 2",
      outcome: "Outcome 2",
      evidenceDiscrepancy: "Minor",
      sources: "Source 2",
      confidenceScore: 0.88,
    },
  ],
}));

describe("InteractiveTimeline", () => {
  it("should render timeline events", () => {
    render(<InteractiveTimeline />);
    
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  it("should display event categories", () => {
    render(<InteractiveTimeline />);
    
    expect(screen.getByText("Legal Proceeding")).toBeInTheDocument();
    expect(screen.getByText("Business Interference")).toBeInTheDocument();
  });

  it("should show confidence scores", () => {
    render(<InteractiveTimeline />);
    
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Testing React Query Integration

```typescript
// src/test/integration/casesFlow.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CasesPage } from "@/pages/Cases";

describe("Cases Flow Integration", () => {
  it("should create, display, and delete a case", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const user = userEvent.setup();

    // Mock Supabase responses
    const mockCases: any[] = [];
    
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "cases") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockCases,
              error: null,
            }),
          }),
          insert: vi.fn().mockImplementation((newCase) => {
            mockCases.push({ id: "new-1", ...newCase });
            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "new-1", ...newCase },
                  error: null,
                }),
              }),
            };
          }),
          delete: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        } as any;
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CasesPage />
      </QueryClientProvider>
    );

    // Initially no cases
    expect(screen.getByText(/no cases found/i)).toBeInTheDocument();

    // Click create button
    await user.click(screen.getByRole("button", { name: /new case/i }));

    // Fill form
    await user.type(screen.getByLabelText(/case number/i), "CF-001");
    await user.type(screen.getByLabelText(/title/i), "Test Case");

    // Submit
    await user.click(screen.getByRole("button", { name: /create/i }));

    // Wait for case to appear
    await waitFor(() => {
      expect(screen.getByText("Test Case")).toBeInTheDocument();
    });

    // Delete case
    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    // Case should be gone
    await waitFor(() => {
      expect(screen.queryByText("Test Case")).not.toBeInTheDocument();
    });
  });
});
```

### Testing Edge Function Integration

```typescript
// src/test/integration/documentAnalysis.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AnalyzePage } from "@/pages/Analyze";

describe("Document Analysis Integration", () => {
  it("should analyze document and extract events", async () => {
    const user = userEvent.setup();

    // Mock Edge Function response
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        eventsExtracted: 5,
        entitiesExtracted: 12,
        discrepanciesExtracted: 3,
      },
      error: null,
    });

    render(<AnalyzePage />);

    // Paste document content
    const textarea = screen.getByPlaceholderText(/paste document/i);
    await user.type(textarea, "Sample legal document content...");

    // Select document type
    await user.click(screen.getByLabelText(/document type/i));
    await user.click(screen.getByText(/legal document/i));

    // Click analyze
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/5 events extracted/i)).toBeInTheDocument();
      expect(screen.getByText(/12 entities extracted/i)).toBeInTheDocument();
      expect(screen.getByText(/3 discrepancies found/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing

### Playwright Setup (Future)

```typescript
// e2e/casesFlow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Cases Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/auth");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL("/dashboard");
  });

  test("should create a new case", async ({ page }) => {
    await page.goto("/cases");
    
    await page.click('button:has-text("New Case")');
    
    await page.fill('input[name="caseNumber"]', "CF-TEST-001");
    await page.fill('input[name="title"]', "Test Case Title");
    await page.fill('textarea[name="description"]', "Test description");
    
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('text=Test Case Title')).toBeVisible();
  });

  test("should navigate to case details", async ({ page }) => {
    await page.goto("/cases");
    
    await page.click('text=Test Case Title');
    
    await expect(page).toHaveURL(/\/cases\/[a-z0-9-]+/);
    await expect(page.locator("h1")).toContainText("Test Case Title");
  });
});
```

---

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
test("should update case title", () => {
  // Arrange
  const case = { id: "1", title: "Old Title" };
  const newTitle = "New Title";

  // Act
  const updated = updateCaseTitle(case, newTitle);

  // Assert
  expect(updated.title).toBe(newTitle);
  expect(updated.id).toBe(case.id);
});
```

### 2. Test Behavior, Not Implementation

```typescript
// ✅ Good - Tests behavior
test("should show error when form is submitted empty", async () => {
  render(<CaseForm onSubmit={vi.fn()} />);
  
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
});

// ❌ Bad - Tests implementation
test("should set formError state to true", () => {
  const { rerender } = render(<CaseForm />);
  // Testing internal state
  expect(component.state.formError).toBe(false);
});
```

### 3. Use Data-TestId Sparingly

```typescript
// ✅ Good - Use semantic queries
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ Bad - Overuse of data-testid
screen.getByTestId("submit-button");
screen.getByTestId("email-input");
```

### 4. Mock External Dependencies

```typescript
// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: { /* ... */ },
  },
}));

// Mock Edge Functions
vi.mocked(supabase.functions.invoke).mockResolvedValue({
  data: mockData,
  error: null,
});
```

### 5. Clean Up After Tests

```typescript
import { afterEach, afterAll } from "vitest";

afterEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Clear local storage
  localStorage.clear();
});

afterAll(() => {
  // Close database connections
  // Clean up test resources
});
```

---

## Running Tests

### Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test src/hooks/useCases.test.ts

# Run tests matching pattern
npm run test -- --grep="Cases"

# Run tests in UI mode
npm run test -- --ui
```

### Watch Mode

```bash
npm run test:watch
```

**Watch mode commands:**
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename
- Press `t` to filter by test name
- Press `q` to quit

---

## Coverage

### Generate Coverage Report

```bash
npm run test -- --coverage
```

### Coverage Thresholds

Add to `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/test/**",
        "**/*.config.ts",
      ],
    },
  },
});
```

### View Coverage Report

After running tests with coverage:

```bash
# Open HTML report
open coverage/index.html
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

---

*For more testing examples, see the `src/test/` directory.*
