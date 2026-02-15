# HRPM.org Component Reference

## Comprehensive Component Library Documentation

This document provides a complete reference for all components in the HRPM platform, organized by category.

---

## Table of Contents

1. [Component Overview](#component-overview)
2. [UI Primitives (shadcn/ui)](#ui-primitives-shadcnui)
3. [Layout Components](#layout-components)
4. [Dashboard Components](#dashboard-components)
5. [Network & Graph Components](#network--graph-components)
6. [Timeline Components](#timeline-components)
7. [Evidence Management](#evidence-management)
8. [Legal Intelligence](#legal-intelligence)
9. [Investigation Tools](#investigation-tools)
10. [Compliance & Regulatory](#compliance--regulatory)
11. [Admin Components](#admin-components)
12. [Landing Page Components](#landing-page-components)

---

## Component Overview

### Component Count by Category

| Category | Count | Purpose |
|----------|-------|---------|
| UI Primitives | 45+ | Base components from shadcn/ui |
| Layout | 10 | App structure and navigation |
| Dashboard | 15 | Analytics and metrics |
| Network/Graph | 15 | Entity visualization |
| Timeline | 12 | Event chronology |
| Evidence | 10 | Document management |
| Legal | 20 | Legal research tools |
| Investigation | 15 | AI-powered analysis |
| Compliance | 12 | Violation tracking |
| Admin | 15 | Content management |
| Landing | 20 | Public pages |
| Other | 30+ | Utility components |

### Design System

**Color Tokens:**
- Primary: Legal authority (blue)
- Destructive: Critical violations (red)
- Success: Compliance met (green)
- Warning: Review needed (amber)
- Muted: Secondary info (gray)

**Spacing Scale:**
- 0.5rem (space-2), 1rem (space-4), 1.5rem (space-6), 2rem (space-8)

**Typography:**
- Headings: font-semibold to font-bold
- Body: font-normal
- Code/Data: font-mono

---

## UI Primitives (shadcn/ui)

### Button Components

#### Button
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="link">Link Style</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

**Variants:**
- `default` - Primary actions
- `destructive` - Dangerous operations
- `outline` - Secondary actions
- `ghost` - Minimal prominence
- `link` - Text-only appearance

#### Toggle & ToggleGroup
```tsx
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

<Toggle>Toggle Me</Toggle>

<ToggleGroup type="single" value={value}>
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>
```

### Form Components

#### Input
```tsx
import { Input } from "@/components/ui/input";

<Input 
  type="text" 
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
<Input type="email" />
<Input type="password" />
<Input type="number" />
<Input type="search" />
```

#### Textarea
```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea 
  placeholder="Enter details..."
  rows={4}
/>
```

#### Select
```tsx
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox & Radio
```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<Checkbox 
  checked={checked}
  onCheckedChange={setChecked}
/>

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
</RadioGroup>
```

#### Switch
```tsx
import { Switch } from "@/components/ui/switch";

<Switch 
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

#### Slider
```tsx
import { Slider } from "@/components/ui/slider";

<Slider 
  value={[value]} 
  onValueChange={([v]) => setValue(v)}
  min={0}
  max={100}
  step={1}
/>
```

### Layout & Container Components

#### Card
```tsx
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion
```tsx
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item1">
    <AccordionTrigger>Question 1</AccordionTrigger>
    <AccordionContent>Answer 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Separator
```tsx
import { Separator } from "@/components/ui/separator";

<Separator /> {/* Horizontal */}
<Separator orientation="vertical" /> {/* Vertical */}
```

#### ScrollArea
```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-[400px]">
  {/* Scrollable content */}
</ScrollArea>
```

#### Collapsible
```tsx
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

### Overlay Components

#### Dialog
```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Alert Dialog
```tsx
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Sheet
```tsx
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

#### Drawer
```tsx
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";

<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description</DrawerDescription>
    </DrawerHeader>
    {/* Content */}
    <DrawerFooter>
      <DrawerClose>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

#### Popover
```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    {/* Popover content */}
  </PopoverContent>
</Popover>
```

#### Tooltip
```tsx
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Hover Card
```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>Details</HoverCardContent>
</HoverCard>
```

### Navigation Components

#### Menubar
```tsx
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarTrigger 
} from "@/components/ui/menubar";

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

#### Dropdown Menu
```tsx
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Context Menu
```tsx
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Action 1</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

#### Navigation Menu
```tsx
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
      <NavigationMenuContent>
        {/* Content */}
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

#### Breadcrumb
```tsx
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Feedback Components

#### Toast
```tsx
import { toast } from "sonner";

// Success
toast.success("Operation completed");

// Error
toast.error("Something went wrong");

// Info
toast.info("Information");

// Warning
toast.warning("Be careful");

// With action
toast("Message", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

#### Progress
```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={33} />
```

#### Skeleton
```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-[250px]" />
```

#### Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Avatar
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

### Data Display Components

#### Table
```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Calendar
```tsx
import { Calendar } from "@/components/ui/calendar";

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

---

## Layout Components

### PlatformLayout
**Location:** `src/components/layout/PlatformLayout.tsx`

Main application shell component.

```tsx
<PlatformLayout>
  {children}
</PlatformLayout>
```

**Features:**
- Collapsible sidebar
- Responsive header
- Main content area
- Breadcrumb navigation
- User menu

### Sidebar
**Location:** `src/components/layout/Sidebar.tsx`

Collapsible navigation sidebar.

```tsx
<Sidebar collapsed={collapsed} onToggle={setCollapsed} />
```

**Sections:**
- Intelligence (Dashboard, Timeline, Network, Investigations)
- Case Management (Cases, Evidence, Uploads)
- Legal & Compliance
- Tools

### Header
**Location:** `src/components/layout/Header.tsx`

Top navigation bar.

**Contains:**
- Breadcrumbs
- Search (⌘K)
- Notifications
- User menu
- Theme toggle

### Breadcrumbs
**Location:** `src/components/layout/Breadcrumbs.tsx`

Auto-generated navigation trail.

```tsx
<Breadcrumbs />
```

**Features:**
- Automatic path detection
- Clickable navigation
- Current page highlighting

---

## Dashboard Components

### IntelDashboard
**Location:** `src/components/dashboard/IntelDashboard.tsx`

Main analytics dashboard.

**Sections:**
- Statistics overview
- AI Case Analyst chat
- Quick actions
- Recent activity

### Charts

#### RadarChart
```tsx
<RadarChart data={violationData} />
```

#### PieChart
```tsx
<PieChart data={categoryData} />
```

#### TreemapChart
```tsx
<TreemapChart data={hierarchicalData} />
```

#### SankeyDiagram
```tsx
<SankeyDiagram data={flowData} />
```

---

## Network & Graph Components

### EntityNetwork
**Location:** `src/components/network/EntityNetwork.tsx`

D3-powered entity relationship graph.

```tsx
<EntityNetwork caseId={caseId} />
```

**Features:**
- Force-directed layout
- Drag & zoom
- Node filtering
- Cluster detection
- Detail panels

### Node Components

#### EntityNode
Visual representation of entities with category coloring.

#### NodeDetailsPanel
Side panel showing entity information.

---

## Timeline Components

### InteractiveTimeline
**Location:** `src/components/timeline/InteractiveTimeline.tsx`

Chronological event visualization.

```tsx
<InteractiveTimeline caseId={caseId} />
```

**Features:**
- Category filtering
- Date range slider
- Event cards
- Search
- Year markers

---

## Evidence Management

### EvidenceUploader
**Location:** `src/components/evidence/EvidenceUploader.tsx`

File upload component.

```tsx
<EvidenceUploader caseId={caseId} onUploadComplete={callback} />
```

**Supported Formats:**
- PDF
- DOCX
- Images (JPG, PNG)
- Text files

### EvidenceMatrix
**Location:** `src/components/evidence/EvidenceMatrix.tsx`

Evidence-to-requirement mapping.

```tsx
<EvidenceMatrix caseId={caseId} />
```

---

## Legal Intelligence

### StatuteBrowser
**Location:** `src/components/legal-intelligence/StatuteBrowser.tsx`

Browse legal statutes by framework.

```tsx
<StatuteBrowser />
```

### CaseLawPanel
**Location:** `src/components/legal-intelligence/CaseLawPanel.tsx`

Search and view precedents.

```tsx
<CaseLawPanel />
```

### DoctrineMapper
**Location:** `src/components/legal-intelligence/DoctrineMapper.tsx`

Link legal doctrines to case facts.

---

## Investigation Tools

### ThreatProfiler
**Location:** `src/components/investigations/ThreatProfiler.tsx`

Generate entity threat assessments.

```tsx
<ThreatProfiler caseId={caseId} />
```

### PatternDetector
**Location:** `src/components/investigations/PatternDetector.tsx`

Identify patterns in investigation data.

```tsx
<PatternDetector caseId={caseId} />
```

### ReportGenerator
**Location:** `src/components/investigations/ReportGenerator.tsx`

Generate formal investigation reports.

```tsx
<ReportGenerator caseId={caseId} />
```

---

## Compliance & Regulatory

### ComplianceTracker
**Location:** `src/components/compliance/ComplianceTracker.tsx`

Track procedural compliance.

```tsx
<ComplianceTracker caseId={caseId} />
```

### ViolationList
**Location:** `src/components/compliance/ViolationList.tsx`

Display compliance violations.

---

## Admin Components

### BlogManager
**Location:** `src/components/admin/BlogManager.tsx`

Create and edit blog posts.

```tsx
<BlogManager />
```

### AuditLogViewer
**Location:** `src/components/admin/AuditLogViewer.tsx`

View system audit trail.

```tsx
<AuditLogViewer />
```

---

## Landing Page Components

### Hero
**Location:** `src/components/landing/Hero.tsx`

Landing page hero section.

### FeaturesSection
**Location:** `src/components/landing/FeaturesSection.tsx`

Feature highlights.

### ParticleField
**Location:** `src/components/landing/ParticleField.tsx`

Animated background effect.

---

*For implementation details, see the source code in `src/components/`.*
