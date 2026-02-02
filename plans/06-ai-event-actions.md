# Phase 6: AI Event Actions

## Goal
Add per-event AI actions that let users expand, rewrite, split, and regenerate event content. All changes preview before applying.

---

## Deliverables

### 6.1 AI Actions Toolbar
- [ ] Action bar at bottom of EventEditor
- [ ] Buttons: Expand, Rewrite, Split, Regenerate
- [ ] Disabled state when:
  - Event is locked
  - Another action is in progress
  - No event selected

### 6.2 Expand Action
- [ ] "Expand" button triggers expansion
- [ ] API call to expand content
- [ ] Preview modal shows before/after
- [ ] Apply or cancel

### 6.3 Rewrite Action
- [ ] "Rewrite" opens options dropdown:
  - Make simpler
  - Make more academic
  - Make more engaging
  - Shorten
- [ ] API call with selected option
- [ ] Preview modal shows before/after

### 6.4 Split Action
- [ ] "Split" only enabled for longer events (>200 words)
- [ ] AI suggests 2-3 new events
- [ ] Preview shows proposed split
- [ ] Apply replaces original with new events

### 6.5 Regenerate Action
- [ ] "Regenerate" opens instruction modal
- [ ] Text input for custom instructions
- [ ] AI generates new content based on instructions
- [ ] Preview shows before/after

### 6.6 Preview Modal
- [ ] `AIPreviewModal` component
- [ ] Side-by-side comparison:
  - Left: Current content
  - Right: Proposed content (highlighted changes)
- [ ] "Apply Changes" and "Cancel" buttons
- [ ] Escape key closes modal

### 6.7 Loading States
- [ ] Button shows spinner during API call
- [ ] Other actions disabled
- [ ] Cancel option available

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

- [ ] AI actions toolbar appears below editor
- [ ] Actions disabled when event is locked
- [ ] **Expand:**
  - [ ] Click shows loading state
  - [ ] Preview modal opens with comparison
  - [ ] Can apply or cancel
  - [ ] Applied changes appear in editor
- [ ] **Rewrite:**
  - [ ] Dropdown shows style options
  - [ ] Each option produces different result
  - [ ] Preview shows before/after
- [ ] **Split:**
  - [ ] Only enabled for longer events
  - [ ] Shows proposed new events
  - [ ] Applying creates multiple events in list
- [ ] **Regenerate:**
  - [ ] Instructions modal opens
  - [ ] Custom instructions affect output
  - [ ] Preview shows result
- [ ] After applying changes:
  - [ ] Event marked as AI-generated (or re-marked)
  - [ ] Auto-save triggers
- [ ] Can cancel any action without changes

---

## Exit Criteria

Phase 6 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. All four AI actions work reliably
4. Preview system feels safe (no surprise changes)
