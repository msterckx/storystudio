# Phase 2: Project Management

**Status: Complete**

## Goal
Enable users to create, view, open, and delete projects. This is the entry point to the application.

---

## Deliverables

### 2.1 Project List Screen
- [x] `ProjectList` component showing all projects
- [x] `ProjectCard` component with:
  - Project title
  - Event count
  - Last modified date
  - Hover actions (Open, Delete)
- [x] Empty state when no projects exist
- [x] Sort by last modified (default)

### 2.2 Create Project Flow
- [x] "New Project" button in project list
- [x] `CreateProjectModal` with:
  - Title input (optional, defaults to "Untitled Project")
  - "Create" and "Cancel" buttons
- [x] API route: `POST /api/projects`
- [x] After creation, navigate to `/projects/[id]`

### 2.3 Open Project
- [x] Click project card → navigate to `/projects/[id]`
- [x] Load project data on workspace page
- [x] Show project title in TopBar (editable)

### 2.4 Delete Project
- [x] Delete button on project card
- [x] Confirmation dialog: "Delete [title]? This cannot be undone."
- [x] API route: `DELETE /api/projects/[id]`
- [x] Cascade delete all events
- [x] Return to project list after deletion

### 2.5 Edit Project Title
- [x] Click title in TopBar to edit
- [x] Inline text input
- [x] Save on blur or Enter
- [x] API route: `PATCH /api/projects/[id]`

### 2.6 Auto-Save Infrastructure
- [x] `useSaveStatus` hook tracking save state
- [x] Debounced save function (2 second delay)
- [x] Save indicator states: idle → saving → saved → error
- [x] Retry logic for failed saves

---

## API Routes

### `GET /api/projects`
Returns all projects, sorted by `updatedAt` desc.

```typescript
Response: {
  projects: Array<{
    id: string
    title: string
    eventCount: number
    createdAt: string
    updatedAt: string
  }>
}
```

### `POST /api/projects`
Creates a new project.

```typescript
Request: {
  title?: string
}
Response: {
  project: { id, title, ... }
}
```

### `GET /api/projects/[id]`
Returns a single project with its events.

```typescript
Response: {
  project: { id, title, settings, ... }
  events: Array<{ id, title, content, ... }>
}
```

### `PATCH /api/projects/[id]`
Updates project fields.

```typescript
Request: {
  title?: string
  settings?: object
}
```

### `DELETE /api/projects/[id]`
Deletes project and all associated data.

---

## Components to Create

```
src/components/features/projects/ProjectList.tsx
src/components/features/projects/ProjectCard.tsx
src/components/features/projects/CreateProjectModal.tsx
src/components/features/projects/DeleteProjectDialog.tsx
src/components/ui/Modal.tsx
src/components/ui/Dialog.tsx
src/hooks/useSaveStatus.ts
src/hooks/useProjects.ts
src/hooks/useProject.ts
```

---

## Database Operations

```typescript
// lib/db/projects.ts
export async function getAllProjects(): Promise<Project[]>
export async function getProject(id: string): Promise<Project | null>
export async function createProject(title?: string): Promise<Project>
export async function updateProject(id: string, data: Partial<Project>): Promise<Project>
export async function deleteProject(id: string): Promise<void>
```

---

## User Testing Checklist

After this phase, verify:

- [x] Project list shows empty state when no projects
- [x] Can create a new project with custom title
- [x] Can create a new project with default title
- [x] New project appears in list immediately
- [x] Can click to open a project
- [x] Project title shows in TopBar when opened
- [x] Can edit project title inline
- [x] Title change persists after page refresh
- [x] Can delete a project
- [x] Confirmation dialog appears before deletion
- [x] Deleted project disappears from list
- [x] Save indicator shows correct states

---

## Exit Criteria

Phase 2 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can create → open → edit → delete project cycle
4. Data persists across page refreshes
