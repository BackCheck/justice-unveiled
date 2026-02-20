

# Platform Audit Report: Broken Links, Missing Registrations, and Issues

## Issues Found

### 1. CRITICAL: Missing Page Registrations

Several routes exist in `App.tsx` but are **missing** from one or more navigation registries, causing blank headers, broken breadcrumbs, or unsearchable pages.

| Route | PlatformLayout Titles | Breadcrumbs | GlobalSearch | Sidebar |
|---|---|---|---|---|
| `/osint-toolkit` | MISSING | MISSING | MISSING | OK |
| `/changelog` | MISSING | MISSING | MISSING | OK |
| `/analysis-history` | MISSING | MISSING | MISSING | OK |
| `/threat-profiler` | MISSING (in titles map) | OK | OK (in allPages) | OK |
| `/who-what-why` | MISSING | MISSING (has `/about` only) | MISSING | OK |

**Impact**: When users visit these pages, the header shows no title/subtitle, breadcrumbs don't render properly, and the pages are not discoverable via Cmd+K search.

**Fix**: Add entries for `/osint-toolkit`, `/changelog`, `/analysis-history`, `/threat-profiler`, and `/who-what-why` to all three registries: `pageTitleKeys` in PlatformLayout, `routeConfig` in Breadcrumbs, and `allPages` in GlobalSearch.

---

### 2. CRITICAL: Privacy Policy and Terms of Service Link to `/who-what-why`

In both `PlatformLayout.tsx` (lines 214-215) and `LandingFooter.tsx` (lines 126-127), the "Privacy Policy" and "Terms of Service" links point to `/who-what-why` (the About page). These are placeholder links -- there are no dedicated privacy or terms pages.

**Fix**: Either create `/privacy` and `/terms` pages, or add privacy/terms sections to the About page and link with anchors (`/who-what-why#privacy`).

---

### 3. MEDIUM: Duplicate Footer Links

In `PlatformLayout.tsx` footer (lines 155-156), there are two links to `/who-what-why`:
- "Who, What & Why" (hardcoded English)
- `{t('nav.about')}` (translated "About")

Both go to the same page. Similarly in `LandingFooter.tsx` (lines 48-49), the same duplication exists.

**Fix**: Remove one of the duplicate links or differentiate them.

---

### 4. MEDIUM: "Profile" and "Settings" Sidebar Menu Items Do Nothing

In `AppSidebar.tsx` (lines 359-365), the "Profile" and "Settings" dropdown menu items have no `onClick` handler and no navigation -- they are non-functional.

**Fix**: Either add navigation to relevant pages or remove the items.

---

### 5. LOW: Landing Page Has No Route

The `Landing.tsx` page exists but has no route in `App.tsx`. The `/` route goes to `Dashboard`. The Landing page is only accessible if explicitly imported somewhere else (it appears unused as a route).

**Fix**: If the Landing page is the intended public homepage, add a route like `/welcome` or conditionally show it for unauthenticated users at `/`.

---

### 6. LOW: GitHub Link May Be Incorrect

Multiple files link to `https://github.com/BackCheck/justice-unveiled`. This should be verified as the correct repository URL.

---

### 7. LOW: Entity Links in AnalysisHistory Use Wrong Path Pattern

In `AnalysisHistory.tsx` line 312, entity links use `/entities/${entity.id}` (database UUID), but `GlobalSearch.tsx` line 211 uses `/entities/ai-${entity.id}`. The `EntityDetail` page route is `/entities/:entityId` -- depending on how it resolves, one pattern may 404.

**Fix**: Ensure consistent entity link patterns across the app.

---

## Implementation Plan

### Step 1: Register Missing Pages in All Three Registries

**File: `src/components/layout/PlatformLayout.tsx`** -- Add to `pageTitleKeys`:
- `/osint-toolkit` with title "OSINT Toolkit", subtitle, and `isAI: true`
- `/changelog` with title "Changelog"
- `/analysis-history` with title "Analysis History" and `isAI: true`
- `/threat-profiler` with title "Threat Profiler" and `isAI: true`
- `/who-what-why` with title "Who, What & Why"

**File: `src/components/layout/Breadcrumbs.tsx`** -- Add to `routeConfig`:
- `/osint-toolkit` parent `/investigations`
- `/changelog` parent `/`
- `/analysis-history` parent `/`
- `/who-what-why` parent `/`

**File: `src/components/layout/GlobalSearch.tsx`** -- Add to `allPages`:
- OSINT Toolkit (investigation category, AI badge)
- Changelog (resources category)
- Analysis History (investigation category, AI badge)
- Who, What & Why (system category)

### Step 2: Fix Privacy/Terms Placeholder Links

Update `PlatformLayout.tsx` and `LandingFooter.tsx` to use anchor links `#privacy` and `#terms` pointing to sections within the About page, and add those sections to `About.tsx`.

### Step 3: Remove Duplicate Footer Links

Remove the duplicate "About" link from both `PlatformLayout.tsx` and `LandingFooter.tsx` footers (keep "Who, What & Why" only).

### Step 4: Fix Non-Functional Sidebar Menu Items

Add `onClick` handlers to "Profile" and "Settings" in `AppSidebar.tsx` that navigate to `/who-what-why` (or a future profile page) and show a toast respectively.

### Step 5: Standardize Entity Link Patterns

Audit and unify entity link patterns (`/entities/ai-{id}` vs `/entities/{id}`) across `GlobalSearch.tsx` and `AnalysisHistory.tsx`.

### Step 6: Add Landing Page Route

Add `/welcome` route in `App.tsx` pointing to the `Landing` component so it's accessible.

---

## Files to Modify

1. `src/components/layout/PlatformLayout.tsx` -- Add missing page titles, fix duplicate/placeholder footer links
2. `src/components/layout/Breadcrumbs.tsx` -- Add missing route configs
3. `src/components/layout/GlobalSearch.tsx` -- Add missing pages to search, fix entity link pattern
4. `src/components/layout/AppSidebar.tsx` -- Fix non-functional menu items
5. `src/components/landing/LandingFooter.tsx` -- Fix duplicate/placeholder links
6. `src/pages/About.tsx` -- Add privacy/terms anchor sections
7. `src/pages/AnalysisHistory.tsx` -- Fix entity link pattern
8. `src/App.tsx` -- Add `/welcome` route for Landing page

