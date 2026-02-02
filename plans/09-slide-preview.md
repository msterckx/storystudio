# Phase 9: Slide Preview

## Goal
Build the live slide preview in the right pane that shows how the current event will appear in the final presentation.

---

## Deliverables

### 9.1 Preview Tab
- [ ] Preview tab in right pane
- [ ] Shows slide preview for selected event
- [ ] Updates in real-time as content changes

### 9.2 Slide Preview Component
- [ ] `SlidePreview` component
- [ ] Renders event as presentation slide:
  - Event title as slide title
  - Content formatted for slide
  - Selected images displayed
  - Image captions shown
- [ ] Maintains aspect ratio (16:9)

### 9.3 Theme Selection
- [ ] Theme dropdown in preview panel
- [ ] Available themes:
  - Academic (clean, professional)
  - Modern (bold, contemporary)
  - Historic (classic, archival)
  - Minimal (whitespace, simple)
- [ ] Theme persists per project

### 9.4 Real-Time Updates
- [ ] Preview updates within 500ms of content change
- [ ] Debounced to prevent excessive re-renders
- [ ] Smooth transition between states

### 9.5 Multiple Slide Layouts
- [ ] Text-only layout (no images)
- [ ] Text + single image
- [ ] Text + multiple images
- [ ] Image-focused layout

### 9.6 Full Preview Mode
- [ ] "Full Preview" button
- [ ] Opens modal with larger slide view
- [ ] Navigate between events/slides
- [ ] Keyboard navigation (← →)

---

## Components to Create

```
src/components/features/preview/PreviewPanel.tsx
src/components/features/preview/SlidePreview.tsx
src/components/features/preview/SlideContent.tsx
src/components/features/preview/SlideImage.tsx
src/components/features/preview/ThemeSelector.tsx
src/components/features/preview/FullPreviewModal.tsx
src/components/features/preview/SlideNavigator.tsx
src/lib/preview/themes.ts
src/lib/preview/layouts.ts
src/hooks/useSlidePreview.ts
```

---

## Theme Definitions

```typescript
// lib/preview/themes.ts
export interface SlideTheme {
  id: string
  name: string
  colors: {
    background: string
    title: string
    text: string
    accent: string
  }
  fonts: {
    title: string
    body: string
  }
  spacing: {
    padding: string
    gap: string
  }
}

export const themes: SlideTheme[] = [
  {
    id: 'academic',
    name: 'Academic',
    colors: {
      background: '#ffffff',
      title: '#1e3a5f',
      text: '#333333',
      accent: '#2563eb',
    },
    fonts: {
      title: 'Georgia, serif',
      body: 'system-ui, sans-serif',
    },
    // ...
  },
  // ... other themes
]
```

---

## Layout Selection Logic

```typescript
// lib/preview/layouts.ts
export function selectLayout(event: Event, images: Image[]): LayoutType {
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1
  const contentLength = event.content.length

  if (!hasImages) return 'text-only'
  if (hasMultipleImages) return 'text-multi-image'
  if (contentLength < 200) return 'image-focused'
  return 'text-single-image'
}
```

---

## Slide Preview Rendering

```typescript
// components/features/preview/SlidePreview.tsx
export function SlidePreview({ event, images, theme }: SlidePreviewProps) {
  const layout = selectLayout(event, images)

  return (
    <div
      className="aspect-video rounded-lg overflow-hidden shadow-lg"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="p-8 h-full flex flex-col">
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
          }}
        >
          {event.title}
        </h2>

        <SlideContent
          layout={layout}
          content={event.content}
          images={images}
          theme={theme}
        />
      </div>
    </div>
  )
}
```

---

## Real-Time Update Hook

```typescript
// hooks/useSlidePreview.ts
export function useSlidePreview(event: Event, images: Image[]) {
  const [previewData, setPreviewData] = useState({ event, images })

  // Debounce updates to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewData({ event, images })
    }, 300)

    return () => clearTimeout(timer)
  }, [event, images])

  return previewData
}
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Preview tab shows in right pane
- [ ] Clicking Preview tab shows slide preview
- [ ] Preview shows event title
- [ ] Preview shows event content (formatted)
- [ ] Preview shows selected images
- [ ] Preview shows image captions
- [ ] Preview maintains 16:9 aspect ratio
- [ ] Theme dropdown shows available themes
- [ ] Changing theme updates preview immediately
- [ ] Theme selection persists after refresh
- [ ] Editing content updates preview in real-time
- [ ] Adding/removing images updates preview
- [ ] Different content lengths show different layouts
- [ ] Full Preview button opens modal
- [ ] Can navigate slides in full preview
- [ ] Arrow keys work in full preview
- [ ] Escape closes full preview

---

## Exit Criteria

Phase 9 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Preview accurately represents final export
4. Real-time updates feel responsive
