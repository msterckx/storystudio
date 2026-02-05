import { callAI } from './call-ai'

const IMAGE_EXPLANATION_SYSTEM_PROMPT = `You are an educational content curator. Write a brief explanation (2-3 sentences) for an image that will be used in an educational presentation.

Your explanation should:
1. Describe what the image likely depicts based on its metadata
2. Explain why it is relevant to the event being discussed

Guidelines:
- Only state facts that can be verified from the metadata
- Do not invent details about what the image shows
- Connect the image to the event's educational content
- Keep it concise and accessible

Return ONLY the explanation text. No labels, no quotes, no markdown.`

export interface ImageExplanationInput {
  imageMetadata: {
    title?: string
    creator?: string
    date?: string
    source: string
  }
  eventTitle: string
  eventContent: string
}

export interface ImageExplanationOutput {
  explanation: string
}

export async function generateImageExplanation(
  input: ImageExplanationInput
): Promise<ImageExplanationOutput> {
  const { imageMetadata, eventTitle, eventContent } = input

  // Strip HTML from event content for the prompt
  const plainContent = eventContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const truncatedContent = plainContent.slice(0, 500)

  const userPrompt = `Image Metadata:
- Title: ${imageMetadata.title || 'Unknown'}
- Creator: ${imageMetadata.creator || 'Unknown'}
- Date: ${imageMetadata.date || 'Unknown'}
- Source: ${imageMetadata.source}

Event: ${eventTitle}
Event Content: ${truncatedContent}

Write a brief explanation for this image in the context of this event.`

  const response = await callAI(IMAGE_EXPLANATION_SYSTEM_PROMPT, userPrompt)

  return {
    explanation: response.trim(),
  }
}
