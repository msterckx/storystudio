# Phase 11: Export

## Goal
Enable users to export their completed story as a presentation file (PowerPoint, PDF).

---

## Deliverables

### 11.1 Export Button & Modal
- [ ] Export button in TopBar
- [ ] `ExportModal` with configuration options
- [ ] Multi-step flow: Options → Preview → Download

### 11.2 Export Options
- [ ] Slide grouping:
  - One slide per event
  - Grouped by sections (AI-suggested)
- [ ] Theme selection (same as preview)
- [ ] Include options (checkboxes):
  - Speaker notes
  - Image captions
  - Credits slide
  - Title slide
  - Table of contents
- [ ] Format selection:
  - PowerPoint (.pptx)
  - PDF

### 11.3 Export Preview
- [ ] Thumbnail carousel of generated slides
- [ ] Click thumbnail to see larger preview
- [ ] Slide count indicator

### 11.4 PowerPoint Generation
- [ ] Install pptxgenjs
- [ ] Generate slides from events
- [ ] Apply selected theme
- [ ] Include images with proper sizing
- [ ] Generate speaker notes from content
- [ ] Generate credits slide

### 11.5 PDF Generation
- [ ] Generate PDF from slides
- [ ] Maintain formatting and images
- [ ] Optional: handout format with notes

### 11.6 Download Flow
- [ ] Progress indicator during generation
- [ ] Auto-download on completion
- [ ] "Download Again" option
- [ ] Success message

### 11.7 Speaker Notes Generation
- [ ] AI generates speaker notes from event content
- [ ] Key talking points extracted
- [ ] Transition suggestions between slides
- [ ] API route: `POST /api/ai/speaker-notes`

---

## API Routes

### `POST /api/export/generate`
Generates presentation file.

```typescript
Request: {
  projectId: string
  options: {
    grouping: 'single' | 'grouped'
    theme: string
    format: 'pptx' | 'pdf'
    includeSpeakerNotes: boolean
    includeImageCaptions: boolean
    includeCreditsSlide: boolean
    includeTitleSlide: boolean
    includeTableOfContents: boolean
  }
}

Response: {
  downloadUrl: string
  filename: string
  slideCount: number
}
```

### `POST /api/ai/speaker-notes`
Generates speaker notes for an event.

```typescript
Request: {
  eventTitle: string
  eventContent: string
  nextEventTitle?: string
}

Response: {
  notes: string
}
```

---

## Components to Create

```
src/components/features/export/ExportModal.tsx
src/components/features/export/ExportOptions.tsx
src/components/features/export/ExportPreview.tsx
src/components/features/export/SlideCarousel.tsx
src/components/features/export/ExportProgress.tsx
src/components/features/export/DownloadComplete.tsx
src/lib/export/pptx.ts
src/lib/export/pdf.ts
src/lib/export/slides.ts
src/lib/export/credits.ts
src/hooks/useExport.ts
```

---

## PowerPoint Generation

```typescript
// lib/export/pptx.ts
import pptxgen from 'pptxgenjs'

export async function generatePPTX(
  project: Project,
  events: Event[],
  images: Map<string, Image[]>,
  options: ExportOptions
): Promise<Blob> {
  const pptx = new pptxgen()

  // Set presentation properties
  pptx.author = 'StoryStudio'
  pptx.title = project.title

  // Apply theme
  const theme = getTheme(options.theme)

  // Title slide
  if (options.includeTitleSlide) {
    addTitleSlide(pptx, project, theme)
  }

  // Table of contents
  if (options.includeTableOfContents) {
    addTOCSlide(pptx, events, theme)
  }

  // Content slides
  for (const event of events) {
    const eventImages = images.get(event.id) || []
    addContentSlide(pptx, event, eventImages, options, theme)
  }

  // Credits slide
  if (options.includeCreditsSlide) {
    addCreditsSlide(pptx, images, theme)
  }

  return await pptx.write({ outputType: 'blob' })
}
```

---

## Credits Slide Generation

```typescript
// lib/export/credits.ts
export function generateCreditsContent(
  images: Map<string, Image[]>
): CreditEntry[] {
  const credits: CreditEntry[] = []

  images.forEach((eventImages, eventId) => {
    for (const image of eventImages) {
      credits.push({
        slideReference: `Slide ${getSlideNumber(eventId)}`,
        imageTitle: image.title || 'Untitled',
        source: image.source,
        sourceUrl: image.sourceUrl,
        license: image.license,
        creator: image.creator,
      })
    }
  })

  return credits
}
```

---

## Speaker Notes Prompt

```
Generate speaker notes for this presentation slide.

Slide Title: {{eventTitle}}
Slide Content: {{eventContent}}
Next Slide: {{nextEventTitle}}

Create concise speaker notes that:
1. Highlight 2-3 key talking points
2. Suggest how to transition to the next slide (if applicable)
3. Include any important context not in the slide text

Keep notes under 150 words.
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Export button visible in TopBar
- [ ] Clicking opens Export modal
- [ ] **Options step:**
  - [ ] Can select slide grouping
  - [ ] Can select theme
  - [ ] Can toggle include options
  - [ ] Can select format
- [ ] **Preview step:**
  - [ ] Slide thumbnails show
  - [ ] Can click thumbnail for larger view
  - [ ] Slide count is correct
- [ ] **Download:**
  - [ ] Progress indicator shows during generation
  - [ ] File downloads automatically
  - [ ] Filename includes project title
- [ ] **PowerPoint output:**
  - [ ] Opens in PowerPoint/Google Slides
  - [ ] Theme is applied correctly
  - [ ] Images display properly
  - [ ] Speaker notes present (if selected)
  - [ ] Credits slide present (if selected)
- [ ] **PDF output:**
  - [ ] Opens in PDF viewer
  - [ ] Formatting is correct
  - [ ] Images display properly
- [ ] Can cancel export at any step
- [ ] Error handling for failed exports

---

## Exit Criteria

Phase 11 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Exported files are usable in target applications
4. Credits properly attribute all images
