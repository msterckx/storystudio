# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StoryStudio is an AI-assisted story building application for education. It transforms a simple idea (e.g., "The Fall of Rome") into a structured, editable timeline of events with curated images and contextual explanations, exportable as educational presentations.

**Core Philosophy:**
- **Structure first** — Stories are discrete, reorderable events, not monolithic text
- **Human-in-the-loop AI** — AI assists drafting/expansion; users maintain full control
- **Educational credibility** — Images are attributed, contextualized, and explained

## Tech Stack

- **Framework**: Next.js 16+ (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Drizzle ORM (stored at `./data/storystudio.db`)
- **AI Integration**: LLM for story generation, expansion, and image explanations

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Architecture

### Three-Pane Editor Layout

1. **Left Pane — Story Structure**
   - Event titles in chronological order
   - Drag-and-drop reordering
   - Visual indicators for AI-generated vs user-edited

2. **Middle Pane — Event Editor**
   - Rich text editing for selected event
   - Per-event AI actions: expand, rewrite, split, regenerate
   - Optional metadata (dates, tags, notes)

3. **Right Pane — Visual Assets & Preview**
   - Image discovery from cultural/historical sources
   - Image inspection with zoom/pan
   - Slide preview showing final presentation layout

### Key Components

- **Command Bar** — Natural language project editing ("Split this event into three parts")
- **Image System** — Source attribution, metadata, editable explanations, dismissal memory
- **Presentation Export** — Slides with themes, speaker notes, auto-credits

### Data Model

- **Project** — Title, global settings (audience, tone, length)
- **Event** — Ordered content blocks with text, metadata, AI/user edit status
- **Image** — Source, license, metadata, contextual explanation, selection state
