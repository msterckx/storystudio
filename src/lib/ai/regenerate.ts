import { callAI } from './call-ai'

const REGENERATE_SYSTEM_PROMPT = `You are an educational content creator. Your task is to regenerate event content based on custom instructions while keeping the same topic.

Guidelines:
- Follow the user's specific instructions carefully
- Keep the content educational and accurate
- Maintain appropriate length (similar to the original unless instructions say otherwise)
- Output should be ready to use as event content

Return ONLY the regenerated content. No explanations, no markdown, no "Here's the regenerated version:" prefix.`

export interface RegenerateInput {
  eventTitle: string
  currentContent: string
  instructions: string
}

export interface RegenerateOutput {
  regeneratedContent: string
}

export async function regenerateContent(input: RegenerateInput): Promise<RegenerateOutput> {
  const userPrompt = `Event Title: "${input.eventTitle}"

Current Content:
${input.currentContent}

User Instructions:
${input.instructions}

Please regenerate the content following the instructions above.`

  const response = await callAI(REGENERATE_SYSTEM_PROMPT, userPrompt)

  return {
    regeneratedContent: response.trim(),
  }
}
