# Phase 6: AI Event Actions

**Status: Complete**

## Goal
Add per-event AI actions that let users expand, rewrite, split, and regenerate event content. All changes preview before applying.

---

## Deliverables

### 6.1 AI Actions Toolbar
- [x] Action bar at bottom of EventEditor
- [x] Buttons: Expand, Rewrite, Split, Regenerate
- [x] Disabled state when:
  - Event is locked
  - Another action is in progress
  - No event selected

### 6.2 Expand Action
- [x] "Expand" button triggers expansion
- [x] API call to expand content
- [x] Preview modal shows before/after
- [x] Apply or cancel

### 6.3 Rewrite Action
- [x] "Rewrite" opens options dropdown:
  - Make simpler
  - Make more academic
  - Make more engaging
  - Shorten
- [x] API call with selected option
- [x] Preview modal shows before/after

### 6.4 Split Action
- [x] "Split" only enabled for longer events (>200 words)
- [x] AI suggests 2-3 new events
- [x] Preview shows proposed split
- [x] Apply replaces original with new events

### 6.5 Regenerate Action
- [x] "Regenerate" opens instruction modal
- [x] Text input for custom instructions
- [x] AI generates new content based on instructions
- [x] Preview shows before/after

### 6.6 Preview Modal
- [x] `AIPreviewModal` component
- [x] Side-by-side comparison:
  - Left: Current content
  - Right: Proposed content (highlighted changes)
- [x] "Apply Changes" and "Cancel" buttons
- [x] Escape key closes modal

### 6.7 Loading States
- [x] Button shows spinner during API call
- [x] Other actions disabled
- [x] Cancel option available

---

## API Routes

### `POST /api/ai/expand`
Expands event content with more detail.

```typescript
Request: {
  eventId: string
  currentContent: string
  eventTitle: string
  projectContext?: string  // Other event titles for context
}
Response: {
  expandedContent: string
}
```

### `POST /api/ai/rewrite`
Rewrites content with different style.

```typescript
Request: {
  eventId: string
  currentContent: string
  style: 'simpler' | 'academic' | 'engaging' | 'shorter'
}
Response: {
  rewrittenContent: string
}
```

### `POST /api/ai/split`
Splits event into multiple events.

```typescript
Request: {
  eventId: string
  currentContent: string
  eventTitle: string
}
Response: {
  events: Array<{
    title: string
    content: string
  }>
}
```

### `POST /api/ai/regenerate`
Regenerates content with custom instructions.

```typescript
Request: {
  eventId: string
  eventTitle: string
  currentContent: string
  instructions: string
}
Response: {
  regeneratedContent: string
}
```

---

## Components to Create

```
src/components/features/ai-actions/AIActionsToolbar.tsx
src/components/features/ai-actions/ExpandButton.tsx
src/components/features/ai-actions/RewriteButton.tsx
src/components/features/ai-actions/SplitButton.tsx
src/components/features/ai-actions/RegenerateButton.tsx
src/components/features/ai-actions/AIPreviewModal.tsx
src/components/features/ai-actions/ContentComparison.tsx
src/components/features/ai-actions/RegenerateInstructionsModal.tsx
src/lib/ai/expand.ts
src/lib/ai/rewrite.ts
src/lib/ai/split.ts
src/lib/ai/regenerate.ts
src/hooks/useAIAction.ts
```

---

## AI Action Hook

```typescript
// hooks/useAIAction.ts
export function useAIAction<TInput, TOutput>(
  actionFn: (input: TInput) => Promise<TOutput>
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle')
  const [result, setResult] = useState<TOutput | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = async (input: TInput) => {
    setStatus('loading')
    try {
      const output = await actionFn(input)
      setResult(output)
      setStatus('preview')
    } catch (e) {
      setError(e)
      setStatus('error')
    }
  }

  const apply = () => { /* Apply changes */ }
  const cancel = () => { setStatus('idle'); setResult(null) }

  return { status, result, error, execute, apply, cancel }
}
```

---

## AI Prompts

### Expand Prompt
```
Expand this educational content with more relevant details.
Maintain the same tone and style.
Do not repeat existing content.
Add historical context, examples, or explanations.
```

### Rewrite Prompts
```
// simpler
Rewrite this content for a younger audience.
Use simpler vocabulary and shorter sentences.
Keep all key facts but make them more accessible.

// academic
Rewrite this content in a more formal, academic tone.
Add scholarly language and precise terminology.
Maintain factual accuracy.

// engaging
Rewrite this content to be more engaging and narrative.
Add vivid descriptions and storytelling elements.
Keep it educational but more compelling.

// shorter
Condense this content to its essential points.
Remove redundancy but keep key facts.
Aim for 50% of the original length.
```

---

## User Testing Checklist

After this phase, verify:

- [x] AI actions toolbar appears below editor
- [x] Actions disabled when event is locked
- [x] **Expand:**
  - [x] Click shows loading state
  - [x] Preview modal opens with comparison
  - [x] Can apply or cancel
  - [x] Applied changes appear in editor
- [x] **Rewrite:**
  - [x] Dropdown shows style options
  - [x] Each option produces different result
  - [x] Preview shows before/after
- [x] **Split:**
  - [x] Only enabled for longer events
  - [x] Shows proposed new events
  - [x] Applying creates multiple events in list
- [x] **Regenerate:**
  - [x] Instructions modal opens
  - [x] Custom instructions affect output
  - [x] Preview shows result
- [x] After applying changes:
  - [x] Event marked as AI-generated (or re-marked)
  - [x] Auto-save triggers
- [x] Can cancel any action without changes

---

## Exit Criteria

Phase 6 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. All four AI actions work reliably
4. Preview system feels safe (no surprise changes)
