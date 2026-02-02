# StoryStudio — UI Overview

This document provides a structured overview of the user interface for **StoryStudio**, an AI-assisted educational storytelling application.

The goal of this document is to describe **what UI elements exist, what they are responsible for, and how they interact**, without prescribing detailed visual design.

---

## 1. Global Layout

### 1.1 Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TopBar                                    │
│  [Logo]  Project Title (editable)    [Save Status]  [⌘K]  [Export] │
├────────────┬────────────────────────────────┬───────────────────────┤
│            │                                │                       │
│   Left     │          Middle                │        Right          │
│   Pane     │          Pane                  │        Pane           │
│            │                                │                       │
│  Structure │       Event Editor             │   Assets & Preview    │
│   Panel    │                                │                       │
│            │                                │                       │
│ ┌────────┐ │  ┌──────────────────────────┐  │  ┌─────────────────┐  │
│ │ Event 1│ │  │ Event Title              │  │  │ [Images][Preview]│  │
│ │ Event 2│ │  │ ────────────────────     │  │  │                 │  │
│ │ Event 3│ │  │ Rich text content...     │  │  │  Image Grid /   │  │
│ │  ...   │ │  │                          │  │  │  Slide Preview  │  │
│ └────────┘ │  │ [Expand][Rewrite][Split] │  │  │                 │  │
│ [+ Add]    │  └──────────────────────────┘  │  └─────────────────┘  │
└────────────┴────────────────────────────────┴───────────────────────┘
```

### 1.2 Application Shell
The application is wrapped in a persistent shell that provides:
- Global navigation
- Project context
- Status feedback (saving, errors)

The shell remains consistent across all primary screens.

### 1.3 Top Bar
The top bar is always visible and contains:
- Application name / logo
- Current project title (editable)
- Save status indicator (e.g. "Saving…", "Saved")
- Access to the global command interface
- Export / presentation actions

The top bar does not contain story-editing controls.

### 1.4 Global Command Interface
A global command / prompt bar allows users to interact with the application using natural language.

Responsibilities:
- Accept free-text commands (e.g. "remove events 1 and 2")
- Preview interpreted actions before execution
- Apply confirmed actions deterministically to project state

The command interface operates across the entire project and is not scoped to a single pane.

---

## 2. Primary Screens

### 2.1 Project List Screen
**Purpose:** Manage and access StoryStudio projects.

Features:
- List of existing projects
- Create new project from prompt
- Duplicate project
- Open existing project

Entry point into the application.

---

### 2.2 Project Workspace Screen
**Purpose:** Create, edit, and refine a story project.

This is the main working environment of StoryStudio.

Layout:
- Three-pane editor (left / middle / right)
- Persistent top bar
- Context-sensitive panels

All story editing happens on this screen.

---

### 2.3 Export / Presentation Screen
**Purpose:** Configure and generate an educational presentation from a completed story.

Features:
- Export settings (template, slide grouping)
- Preview of generated slides
- Trigger export process
- Download generated presentation

This screen is read-only with respect to story content.

---

## 3. Project Workspace Layout (Three-Pane Editor)

### 3.1 Left Pane — Structure Panel
**Purpose:** Display and manage the structure of the story.

Contents:
- Ordered list of event titles
- Visual indicators for selection and edit state

#### Event States
Each event in the list displays visual indicators for its current state:

| State | Indicator | Description |
|-------|-----------|-------------|
| Default | Normal styling | Unselected, no special status |
| Selected | Highlighted background | Currently active in editor |
| AI-generated | AI badge/icon | Content created by AI, not yet edited |
| User-edited | No badge (or user icon) | Content has been modified by user |
| Locked | Lock icon | Protected from AI modifications |
| Unsaved | Dot indicator | Has pending changes |

Interactions:
- Select an event
- Drag-and-drop to reorder events
- Add new event
- Remove event

Outputs:
- Active event selection
- Updated event order

This pane answers: *"What events exist and in what order?"*

---

### 3.2 Middle Pane — Event Editor
**Purpose:** View and edit the full content of the selected event.

Contents:
- Editable event title
- Rich text editor for event narrative
- Optional metadata (dates, tags, notes)

Interactions:
- Direct text editing
- AI-assisted actions:
  - Expand event
  - Rewrite content
  - Split event into multiple events
  - Regenerate content with hints
- Lock/unlock user-edited content
- Delete event

Outputs:
- Updated event content
- Updated metadata
- Signals to regenerate related assets (e.g. images)

This pane answers: *"What happens in this event?"*

---

### 3.3 Right Pane — Assets & Preview Panel
**Purpose:** Manage visual assets and preview presentation output.

The right pane is context-aware and switches between sub-modes.

#### Mode Switching
Users switch between modes using tabs at the top of the pane:

```
┌─────────────────────────────────┐
│  [Images]  |  [Preview]         │
├─────────────────────────────────┤
│                                 │
│  Tab content area               │
│                                 │
└─────────────────────────────────┘
```

- **Images tab**: Shows Image Discovery and Image Details modes
- **Preview tab**: Shows Slide Preview mode
- Image Details appears inline when an image is selected from the grid

#### 3.3.1 Image Discovery Mode
- Displays candidate images related to the selected event
- Shows image thumbnails with metadata summaries
- Allows users to:
  - Select images
  - Dismiss images (persistently)
  - View image source and license

#### 3.3.2 Image Details Mode
- Displays selected images for the event
- Allows editing of image captions / explanations
- Supports reordering selected images

#### 3.3.3 Slide Preview Mode
- Shows a live preview of how the current event will appear in the presentation
- Updates automatically as text or images change

This pane answers: *"What visuals support this event, and how will it look?"*

---

## 4. Data Flow

### 4.1 Event Selection Flow
```
User clicks event in EventList (Left Pane)
        ↓
EventEditor (Middle Pane) loads event content
        ↓
ImageGrid (Right Pane) fetches/displays images for event
        ↓
SlidePreview updates with current event data
```

### 4.2 Content Update Flow
```
User edits content in EventEditor
        ↓
Auto-save triggers after 2 second debounce
        ↓
Save indicator updates in TopBar ("Saving…" → "Saved")
        ↓
SlidePreview re-renders with new content
        ↓
If significant content change: trigger image re-discovery (optional)
```

### 4.3 AI Action Flow
```
User triggers AI action (e.g. "Expand")
        ↓
Loading state shown on action button
        ↓
AI generates new content
        ↓
Preview modal shows proposed changes
        ↓
User confirms or cancels
        ↓
If confirmed: content updated, auto-save triggered
```

### 4.4 Command Bar Flow
```
User opens command bar (⌘K)
        ↓
User types natural language command
        ↓
AI interprets command intent
        ↓
Preview shows affected events/changes
        ↓
User confirms execution
        ↓
Changes applied to project state
        ↓
Undo entry created
```

---

## 5. Image Inspector

### 5.1 Purpose
The Image Inspector allows users to closely examine an image before selecting it for use.

### 5.2 Behavior
- Opens as a modal overlay
- Does not replace the current screen
- Maintains project and event context

### 5.3 Contents
- High-resolution image display
- Zoom and pan controls
- Image metadata:
  - Title
  - Creator / artist
  - Date or period
  - Medium / type
  - Source and license
- Contextual explanatory text describing:
  - What the image depicts
  - Why it is relevant to the event

### 5.4 Actions
- Select image for event
- Dismiss image
- Regenerate explanation
- Open original source

---

## 6. Shared UI Components

### 6.1 Command Bar
- Global, always accessible
- Accepts natural-language instructions
- Shows interpretation preview
- Supports undo-friendly execution

### 6.2 Confirmation Dialogs
Used for:
- Deleting events
- Applying large command actions
- Discarding changes

### 6.3 Notifications
- Save status feedback
- Error messages
- Export completion messages

---

## 7. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command bar |
| `Cmd/Ctrl + S` | Force save |
| `↑ / ↓` | Navigate events in list |
| `Enter` | Select highlighted event |
| `Escape` | Close modal / inspector / command bar |
| `Cmd/Ctrl + Z` | Undo last action |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + B` | Bold (in editor) |
| `Cmd/Ctrl + I` | Italic (in editor) |

---

## 8. Error Handling

### 8.1 Error States by Context

| Context | Error Display | Recovery Action |
|---------|---------------|-----------------|
| Save failure | Persistent warning in TopBar | Auto-retry with exponential backoff |
| AI action failure | Inline error in EventEditor | "Retry" button, original content preserved |
| Image fetch failure | Empty state in ImageGrid | "Retry" button, skip failed sources |
| Export failure | Modal with error details | "Retry" or "Download partial" |
| Network offline | Banner below TopBar | Auto-reconnect, queue pending saves |

### 8.2 Error Recovery Principles
- **Never lose user data**: Failed saves are queued and retried
- **Preserve context**: Errors shown inline where they occur
- **Offer escape hatches**: Always provide retry or alternative actions
- **Degrade gracefully**: Partial functionality when some services fail

---

## 9. Component Inventory (Implementation-Oriented)

This section lists major reusable UI components.

### 9.1 Structural Components
- `ApplicationShell`
- `TopBar`
- `ThreePaneLayout`

### 9.2 Navigation Components
- `ProjectList`
- `EventList`
- `EventListItem`

### 9.3 Editing Components
- `EventEditor`
- `RichTextEditor`
- `MetadataEditor`

### 9.4 Asset Components
- `ImageGrid`
- `ImageCard`
- `ImageInspector`
- `ImageMetadataPanel`

### 9.5 Preview & Output Components
- `SlidePreview`
- `ExportSettingsPanel`

### 9.6 Feedback Components
- `SaveIndicator`
- `CommandBar`
- `ConfirmationDialog`
- `Toast` / `Notification`
- `ErrorBanner`

---

## 10. UI Design Principles

The StoryStudio UI follows these principles:

- **Structure over prose:** events are first-class units
- **Human-in-the-loop AI:** AI assists but never overrides silently
- **Transparency:** all generated content is visible and editable
- **Non-destructive editing:** actions are reversible where possible
- **Educational clarity:** images are contextualized and attributed

---

## 11. Scope Notes

Out of scope for initial versions:
- Real-time multi-user collaboration
- Inline commenting
- Advanced theming or branding tools

These may be introduced in later iterations.

---
