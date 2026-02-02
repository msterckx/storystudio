# Phase 8: Image Inspector & Explanations

## Goal
Build the full-screen image inspector for detailed examination and add AI-generated explanations for selected images.

---

## Deliverables

### 8.1 Image Inspector Modal
- [ ] Full-screen modal overlay
- [ ] Large image display area
- [ ] Metadata sidebar
- [ ] Actions: Select, Dismiss, Close

### 8.2 Zoom and Pan
- [ ] Zoom controls (+/- buttons)
- [ ] Zoom with scroll wheel
- [ ] Pan by clicking and dragging
- [ ] Reset to fit view button
- [ ] Zoom range: 50% - 400%

### 8.3 Metadata Display
- [ ] Full metadata panel:
  - Title
  - Creator/Artist
  - Date/Period
  - Medium/Type
  - Source
  - License (with explanation)
- [ ] Link to original source

### 8.4 Image Explanations
- [ ] AI-generated explanation for each selected image
- [ ] Explanation describes:
  - What the image shows
  - Why it's relevant to the event
- [ ] Explanation stored with image-event association

### 8.5 Explanation Editing
- [ ] Editable explanation textarea
- [ ] Auto-save explanation changes
- [ ] Lock toggle to prevent AI regeneration

### 8.6 Regenerate Explanation
- [ ] "Regenerate" button for explanation
- [ ] Respects lock state
- [ ] API call to generate new explanation

### 8.7 Selected Images Panel
- [ ] Enhanced view of selected images
- [ ] Click to open inspector
- [ ] Drag to reorder
- [ ] Remove button
- [ ] Show explanation preview

---

## API Routes

### `POST /api/ai/image-explanation`
Generates explanation for an image.

```typescript
Request: {
  imageMetadata: {
    title?: string
    creator?: string
    date?: string
    source: string
  }
  eventTitle: string
  eventContent: string
}
Response: {
  explanation: string
}
```

### `PATCH /api/projects/[id]/events/[eventId]/images/[imageId]`
Updates image association.

```typescript
Request: {
  explanation?: string
  explanationLocked?: boolean
  orderIndex?: number
}
```

---

## Components to Create

```
src/components/features/images/ImageInspector.tsx
src/components/features/images/ImageViewer.tsx
src/components/features/images/ZoomControls.tsx
src/components/features/images/ImageMetadataPanel.tsx
src/components/features/images/ImageExplanation.tsx
src/components/features/images/SelectedImagesList.tsx
src/components/features/images/SelectedImageCard.tsx
src/lib/ai/image-explanation.ts
src/hooks/useImageZoom.ts
```

---

## Image Viewer Implementation

```typescript
// hooks/useImageZoom.ts
export function useImageZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const zoomIn = () => setZoom(z => Math.min(z * 1.25, 4))
  const zoomOut = () => setZoom(z => Math.max(z / 1.25, 0.5))
  const resetZoom = () => { setZoom(1); setPosition({ x: 0, y: 0 }) }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return
    setPosition(p => ({
      x: p.x + e.movementX,
      y: p.y + e.movementY,
    }))
  }

  return { zoom, position, zoomIn, zoomOut, resetZoom, handleWheel, handleDrag, ... }
}
```

---

## AI Explanation Prompt

```
Based on the image metadata and event context, write a brief explanation (2-3 sentences) of:
1. What this image depicts
2. Why it is relevant to this event

Image Metadata:
- Title: {{title}}
- Creator: {{creator}}
- Date: {{date}}
- Source: {{source}}

Event: {{eventTitle}}
Event Content: {{eventContent}}

Guidelines:
- Only state facts that can be verified from the metadata
- Do not invent details about what the image shows
- Connect the image to the event's educational content
- Keep it concise and accessible
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Can click image in grid to open inspector
- [ ] Inspector shows large image
- [ ] Can zoom in with + button
- [ ] Can zoom out with - button
- [ ] Can zoom with scroll wheel
- [ ] Can pan image when zoomed
- [ ] Reset button restores default view
- [ ] Metadata panel shows all available info
- [ ] Can click source link to open original
- [ ] Selecting image generates explanation
- [ ] Explanation appears in selected images section
- [ ] Can edit explanation text
- [ ] Edited explanation saves automatically
- [ ] Can lock explanation
- [ ] Locked explanations don't regenerate
- [ ] Can regenerate unlocked explanations
- [ ] Can reorder selected images by dragging
- [ ] Can remove image from selected
- [ ] Inspector closes with X or Escape

---

## Exit Criteria

Phase 8 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Image inspection feels smooth and responsive
4. Explanations are contextually relevant
