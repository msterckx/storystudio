# StoryStudio Development Plan — Overview

This document outlines the phased development approach for StoryStudio. Each phase delivers a testable increment of functionality.

## Guiding Principles

1. **Vertical slices** — Each phase delivers end-to-end functionality, not just UI or just backend
2. **User testable** — Every phase ends with something a real user can interact with
3. **Incremental value** — Earlier phases provide value even if later phases are delayed
4. **Risk front-loading** — Complex integrations (AI, external APIs) come early to surface issues

---

## Phase Summary

| Phase | Name | Deliverable | User Can... |
|-------|------|-------------|-------------|
| 1 | Foundation | App shell, database, routing | See the app layout, navigate between screens |
| 2 | Project Management | CRUD for projects | Create, open, and delete projects |
| 3 | Event Structure | Left pane functionality | Add, reorder, and delete events manually |
| 4 | Event Editor | Middle pane functionality | Write and format event content |
| 5 | AI Story Generation | Initial story creation | Generate a story from a prompt |
| 6 | AI Event Actions | Per-event AI tools | Expand, rewrite, split events with AI |
| 7 | Image Discovery | Right pane - images | Find and select images for events |
| 8 | Image Inspector | Image details & explanations | Inspect images, edit explanations |
| 9 | Slide Preview | Right pane - preview | See live preview of presentation |
| 10 | Command Bar | Natural language interface | Edit project with text commands |
| 11 | Export | Presentation generation | Download a PowerPoint/PDF |
| 12 | Polish | Keyboard nav, a11y, performance | Use the complete, polished app |

---

## Dependency Graph

```
Phase 1: Foundation
    ↓
Phase 2: Project Management
    ↓
Phase 3: Event Structure ←────────────────┐
    ↓                                     │
Phase 4: Event Editor                     │
    ↓                                     │
Phase 5: AI Story Generation              │
    ↓                                     │
Phase 6: AI Event Actions                 │
    ↓                                     │
Phase 7: Image Discovery ─────────────────┤
    ↓                                     │
Phase 8: Image Inspector                  │
    ↓                                     │
Phase 9: Slide Preview ───────────────────┘
    ↓
Phase 10: Command Bar (requires events + AI)
    ↓
Phase 11: Export (requires all content features)
    ↓
Phase 12: Polish
```

---

## Tech Stack Decisions

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14+ (App Router) | Modern React, built-in routing, API routes |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| Database | SQLite + Drizzle ORM | Simple, file-based, no server needed |
| Rich Text | Tiptap | Extensible, good React support |
| Drag & Drop | dnd-kit | Accessible, flexible |
| AI | OpenAI API (or Anthropic) | Story generation, content editing |
| Image API | Wikimedia Commons | Free, well-documented, educational focus |
| Export | pptxgenjs | Client-side PowerPoint generation |

---

## Testing Strategy

Each phase includes:

1. **Developer verification** — Automated tests where applicable
2. **User acceptance testing** — Manual testing checklist
3. **Feedback collection** — What works, what doesn't, what's missing

---

## File Index

- `01-foundation.md` — Project setup, layout, database
- `02-project-management.md` — Project CRUD, dashboard
- `03-event-structure.md` — Left pane, event list
- `04-event-editor.md` — Middle pane, rich text
- `05-ai-story-generation.md` — Initial AI integration
- `06-ai-event-actions.md` — Per-event AI tools
- `07-image-discovery.md` — Image search and selection
- `08-image-inspector.md` — Image details and explanations
- `09-slide-preview.md` — Live preview
- `10-command-bar.md` — Natural language interface
- `11-export.md` — Presentation generation
- `12-polish.md` — Accessibility, performance, final touches
