import { callAI } from './call-ai'

export type RewriteStyle = 'simpler' | 'academic' | 'engaging' | 'shorter'

const stylePrompts: Record<RewriteStyle, string> = {
  simpler: `Rewrite this content for a younger audience.
Use simpler vocabulary and shorter sentences.
Keep all key facts but make them more accessible.
Aim for elementary to middle school reading level.`,

  academic: `Rewrite this content in a more formal, academic tone.
Add scholarly language and precise terminology.
Maintain factual accuracy.
Include analytical depth where appropriate.`,

  engaging: `Rewrite this content to be more engaging and narrative.
Add vivid descriptions and storytelling elements.
Keep it educational but more compelling.
Use active voice and dynamic language.`,

  shorter: `Condense this content to its essential points.
Remove redundancy but keep key facts.
Aim for approximately 50% of the original length.
Maintain clarity and accuracy.`,
}

const REWRITE_SYSTEM_PROMPT = `You are an educational content rewriter. Your task is to rewrite the given content according to specific style instructions.

Return ONLY the rewritten content. No explanations, no markdown, no "Here's the rewritten version:" prefix.`

export interface RewriteInput {
  currentContent: string
  style: RewriteStyle
}

export interface RewriteOutput {
  rewrittenContent: string
}

export async function rewriteContent(input: RewriteInput): Promise<RewriteOutput> {
  const styleInstructions = stylePrompts[input.style]

  const userPrompt = `Style Instructions:
${styleInstructions}

Content to Rewrite:
${input.currentContent}`

  const response = await callAI(REWRITE_SYSTEM_PROMPT, userPrompt)

  return {
    rewrittenContent: response.trim(),
  }
}
