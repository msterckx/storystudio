import { callAI } from './call-ai'

const EXPAND_SYSTEM_PROMPT = `You are an educational content expander. Your task is to expand the given content with more relevant details while maintaining the same tone and style.

Guidelines:
- Do not repeat existing content
- Add historical context, examples, or explanations
- Maintain factual accuracy
- Keep the same writing style and tone
- The expanded content should flow naturally from the original
- Target approximately 50-100% more content than the original

Return ONLY the expanded content. No explanations or markdown.`

export interface ExpandInput {
  eventTitle: string
  currentContent: string
  projectContext?: string // Other event titles for context
}

export interface ExpandOutput {
  expandedContent: string
}

export async function expandContent(input: ExpandInput): Promise<ExpandOutput> {
  const userPrompt = `Event Title: "${input.eventTitle}"

${input.projectContext ? `Project Context (other events): ${input.projectContext}\n\n` : ''}Current Content:
${input.currentContent}

Please expand this content with more relevant details.`

  const response = await callAI(EXPAND_SYSTEM_PROMPT, userPrompt)

  return {
    expandedContent: response.trim(),
  }
}
