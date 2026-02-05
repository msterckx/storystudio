# Phase 7: Image Discovery

**Status: Complete**

## Goal
Build the image discovery system in the right pane. Users can find, select, and dismiss images from cultural heritage sources.

---

## Deliverables

### 7.1 Right Pane Tabs
- [x] Tab navigation: [Images] | [Preview]
- [x] Images tab active by default
- [x] Tab state persists during session

### 7.2 Image Search Integration
- [x] Wikimedia Commons API integration
- [x] Search triggered when event selected
- [x] Extract search terms from event title/content
- [x] Return 8-12 candidate images

### 7.3 Image Grid Display
- [x] `ImageGrid` component showing candidates
- [x] `ImageCard` component with:
  - Thumbnail image
  - Source badge (e.g., "Wikimedia")
  - Select/Dismiss buttons on hover
- [x] Loading skeleton while fetching
- [x] Empty state when no images found

### 7.4 Image Selection
- [x] Click to select image for event
- [x] Selected images shown in separate section above grid
- [x] Multiple images can be selected
- [x] Selection persisted to database
- [x] API route: `POST /api/projects/[id]/events/[eventId]/images`

### 7.5 Image Dismissal
- [x] Dismiss button removes image from candidates
- [x] Dismissed images don't reappear for this event
- [x] Dismissal persisted to database
- [x] "Show dismissed" toggle (optional)

### 7.6 Image Metadata Display
- [x] Basic metadata on card hover:
  - Source
  - License type
  - Date (if available)

---

## API Routes

### `GET /api/images/search`
Searches for images based on query.

```typescript
Request: {
  query: string
  limit?: number (default 12)
}
Response: {
  images: Array<{
    id: string
    thumbnailUrl: string
    fullUrl: string
    source: string
    sourceUrl: string
    license: string
    title?: string
    creator?: string
    date?: string
  }>
}
```

### `POST /api/projects/[id]/events/[eventId]/images`
Saves selected image to event.

```typescript
Request: {
  imageId: string
  thumbnailUrl: string
  fullUrl: string
  source: string
  sourceUrl: string
  license: string
  metadata: { ... }
}
```

### `DELETE /api/projects/[id]/events/[eventId]/images/[imageId]`
Removes image from event.

### `POST /api/projects/[id]/events/[eventId]/images/dismiss`
Dismisses an image for this event.

```typescript
Request: {
  imageId: string
}
```

---

## Database Schema Addition

```typescript
// images table
id: text (primary key)
sourceUrl: text
thumbnailUrl: text
fullUrl: text
source: text
license: text
title: text
creator: text
date: text
medium: text
createdAt: integer

// event_images junction table
eventId: text (foreign key)
imageId: text (foreign key)
explanation: text
explanationLocked: integer (boolean)
selected: integer (boolean)
dismissed: integer (boolean)
orderIndex: integer
PRIMARY KEY (eventId, imageId)
```

---

## Wikimedia Commons Integration

```typescript
// lib/images/wikimedia.ts
const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'

export async function searchWikimediaImages(query: string): Promise<Image[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`${WIKIMEDIA_API}?${params}`)
  const data = await response.json()

  return parseWikimediaResponse(data)
}
```

---

## Components to Create

```
src/components/features/images/ImagePanel.tsx
src/components/features/images/ImageTabs.tsx
src/components/features/images/ImageGrid.tsx
src/components/features/images/ImageCard.tsx
src/components/features/images/SelectedImages.tsx
src/components/features/images/ImageSkeleton.tsx
src/lib/images/wikimedia.ts
src/lib/images/index.ts
src/hooks/useImageSearch.ts
src/hooks/useEventImages.ts
src/app/api/images/search/route.ts
src/app/api/projects/[id]/events/[eventId]/images/route.ts
```

---

## Search Term Extraction

```typescript
// lib/images/search-terms.ts
export function extractSearchTerms(event: Event): string {
  // Combine title and first paragraph
  // Remove common words
  // Return top 3-5 keywords
  const text = `${event.title} ${getFirstParagraph(event.content)}`
  const keywords = extractKeywords(text)
  return keywords.slice(0, 5).join(' ')
}
```

---

## User Testing Checklist

After this phase, verify:

- [x] Right pane shows Images and Preview tabs
- [x] Images tab is active by default
- [x] Selecting an event triggers image search
- [x] Loading skeletons show while searching
- [x] Image grid displays candidate images
- [x] Each image shows source badge
- [x] Hovering shows Select/Dismiss buttons
- [x] Can select an image
- [x] Selected images appear in top section
- [x] Can select multiple images
- [x] Can dismiss an image
- [x] Dismissed images disappear from grid
- [x] Dismissed images don't reappear on refresh
- [x] Selected images persist after page refresh
- [x] Empty state shows when no images found
- [x] Different events show different images

---

## Exit Criteria

Phase 7 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Images are relevant to event content
4. Selection/dismissal persists correctly
