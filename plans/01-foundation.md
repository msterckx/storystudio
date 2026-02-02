# Phase 1: Foundation

**Status: Complete**

## Goal
Set up the project infrastructure and create the basic application shell that all future features will build upon.

---

## Deliverables

### 1.1 Project Initialization
- [x] Initialize Next.js 14+ with App Router
- [x] Configure TypeScript with strict mode
- [x] Set up Tailwind CSS
- [x] Configure ESLint + Prettier
- [x] Create folder structure:
  ```
  src/
  ├── app/                 # Next.js App Router
  │   ├── layout.tsx
  │   ├── page.tsx         # Redirects to /projects
  │   ├── projects/
  │   │   └── page.tsx     # Project list
  │   └── projects/[id]/
  │       └── page.tsx     # Project workspace
  ├── components/
  │   ├── layout/
  │   ├── ui/
  │   └── features/
  ├── lib/
  │   ├── db/
  │   └── utils/
  └── types/
  ```

### 1.2 Database Setup
- [x] Install and configure Drizzle ORM with SQLite
- [x] Create initial schema:
  ```typescript
  // projects table
  id: text (primary key)
  title: text
  settings: text (JSON)
  createdAt: integer (timestamp)
  updatedAt: integer (timestamp)

  // events table
  id: text (primary key)
  projectId: text (foreign key)
  orderIndex: integer
  title: text
  content: text
  metadata: text (JSON)
  source: text ('ai' | 'user')
  locked: integer (boolean)
  createdAt: integer
  updatedAt: integer
  ```
- [x] Set up migrations
- [x] Create database utility functions

### 1.3 Layout Components
- [x] `ApplicationShell` — Root layout wrapper
- [x] `TopBar` — Header with logo, title area, action buttons
- [x] `ThreePaneLayout` — Resizable three-column layout
- [x] `SaveIndicator` — Shows save status

### 1.4 Basic Routing
- [x] `/` → Redirect to `/projects`
- [x] `/projects` → Project list (placeholder)
- [x] `/projects/[id]` → Project workspace (placeholder)

### 1.5 UI Primitives
- [x] Button component (primary, secondary, ghost, destructive)
- [x] Input component
- [x] Card component
- [x] Basic color tokens in Tailwind config

---

## Technical Decisions

### Database Location
SQLite database stored at `./data/storystudio.db` (gitignored).

### State Management
- Server state: React Query (TanStack Query) for data fetching
- UI state: React useState/useReducer, no global store initially

### Styling Approach
- Tailwind for all styling
- No CSS modules or styled-components
- Component variants via className props or cva()

---

## Files to Create

```
src/app/layout.tsx
src/app/page.tsx
src/app/projects/page.tsx
src/app/projects/[id]/page.tsx
src/components/layout/ApplicationShell.tsx
src/components/layout/TopBar.tsx
src/components/layout/ThreePaneLayout.tsx
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Card.tsx
src/components/ui/SaveIndicator.tsx
src/lib/db/schema.ts
src/lib/db/index.ts
src/lib/db/migrations/
src/types/index.ts
tailwind.config.ts (update)
drizzle.config.ts
```

---

## User Testing Checklist

After this phase, verify:

- [x] App loads without errors
- [x] Can navigate to `/projects` (shows placeholder)
- [x] Can navigate to `/projects/test` (shows three-pane layout)
- [x] TopBar displays with logo and placeholder title
- [x] Three panes are visible and resize handles work
- [x] Save indicator shows "Saved" state
- [x] Database file is created on first run
- [x] Responsive: panes collapse appropriately on smaller screens

---

## Exit Criteria

Phase 1 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. No console errors in development
4. Database migrations run successfully
