# Phase 5: AI Story Generation

## Goal
Enable users to generate a complete story outline from a text prompt. This is the primary entry point for new content creation.

---

## Deliverables

### 5.1 Story Generation Modal
- [ ] Update "New Project" flow to include generation option
- [ ] `GenerateStoryModal` with:
  - Prompt textarea
  - Settings dropdowns:
    - Audience level (Elementary → College)
    - Tone (Formal, Conversational, Academic, Storytelling)
    - Length (Brief 5-7, Standard 8-12, Detailed 13-20)
  - "Generate" and "Start Blank" buttons
- [ ] Placeholder examples in prompt field

### 5.2 AI Integration Setup
- [ ] Environment variable for API key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
- [ ] AI service abstraction layer
- [ ] API route: `POST /api/ai/generate-story`
- [ ] Rate limiting / error handling

### 5.3 Story Generation Prompt
- [ ] System prompt for story generation
- [ ] Include audience, tone, length constraints
- [ ] Request structured JSON output
- [ ] Parse response into events

### 5.4 Generation UI States
- [ ] Loading state with progress message
- [ ] Success: navigate to project with events
- [ ] Error: show message, allow retry
- [ ] Cancel: abort request, stay on modal

### 5.5 Project Settings Storage
- [ ] Save generation settings to project
- [ ] Display settings in project workspace (read-only for now)

---

## API Routes

### `POST /api/ai/generate-story`
Generates a story outline from a prompt.

```typescript
Request: {
  prompt: string
  settings: {
    audienceLevel: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'general'
    tone: 'formal' | 'conversational' | 'academic' | 'storytelling'
    targetLength: 'brief' | 'standard' | 'detailed'
  }
}

Response: {
  title: string
  events: Array<{
    title: string
    content: string
    suggestedDate?: string
  }>
}
```

---

## AI Prompt Template

```typescript
const systemPrompt = `You are an educational content creator. Generate a structured story outline for the given topic.

Output Format:
Return a JSON object with:
- title: A clear, descriptive title for the story
- events: An array of event objects, each with:
  - title: A concise event title (max 60 characters)
  - content: 2-4 paragraphs of educational content
  - suggestedDate: Optional date or time period

Guidelines:
- Audience Level: {{audienceLevel}}
- Tone: {{tone}}
- Target Events: {{targetLength}}
- Events should be chronologically ordered
- Each event should be a distinct, meaningful unit
- Content should be factually accurate and educational
- Avoid filler events or redundant information

Return ONLY valid JSON, no markdown or explanation.`

const userPrompt = `Create a story about: {{prompt}}`
```

---

## Components to Create

```
src/components/features/generation/GenerateStoryModal.tsx
src/components/features/generation/PromptInput.tsx
src/components/features/generation/SettingsSelector.tsx
src/components/features/generation/GenerationProgress.tsx
src/lib/ai/index.ts
src/lib/ai/generate-story.ts
src/lib/ai/prompts.ts
src/app/api/ai/generate-story/route.ts
```

---

## AI Service Abstraction

```typescript
// lib/ai/index.ts
export interface AIProvider {
  generateStory(prompt: string, settings: GenerationSettings): Promise<StoryOutline>
}

// Start with OpenAI, can swap later
export const ai: AIProvider = new OpenAIProvider()
```

---

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| API key missing | "AI service not configured" | Show setup instructions |
| Rate limited | "Too many requests. Please wait." | Show countdown, auto-retry |
| Invalid response | "Couldn't parse the response. Trying again..." | Auto-retry once |
| Network error | "Connection failed. Check your internet." | Manual retry button |
| Timeout (>30s) | "Taking too long. Try a simpler prompt." | Manual retry |

---

## User Testing Checklist

After this phase, verify:

- [ ] "New Project" shows generation modal
- [ ] Can enter a prompt (e.g., "The Fall of Rome")
- [ ] Can select audience level
- [ ] Can select tone
- [ ] Can select target length
- [ ] "Generate" shows loading state
- [ ] Loading shows progress message
- [ ] Successful generation creates project with events
- [ ] Events appear in left pane
- [ ] Event content is relevant to prompt
- [ ] Settings are saved to project
- [ ] Can cancel generation
- [ ] Errors show helpful messages
- [ ] Can retry after error
- [ ] "Start Blank" creates empty project

---

## Exit Criteria

Phase 5 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can generate a coherent story from any reasonable prompt
4. Generated events are editable in the editor
