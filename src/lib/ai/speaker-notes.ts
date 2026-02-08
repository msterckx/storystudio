import { callAI } from './call-ai'

const SPEAKER_NOTES_SYSTEM_PROMPT = `You are an educational presentation coach. Generate speaker notes for a presentation slide.

Your notes should:
1. Highlight 2-3 key talking points from the slide content
2. Suggest how to transition to the next slide (if a next slide title is provided)
3. Include any important context not visible on the slide

Guidelines:
- Keep notes under 150 words
- Use natural, conversational language suitable for reading aloud
- Focus on what the presenter should say, not what the slide shows
- If there is a next slide, end with a brief transition sentence

Return ONLY the speaker notes text. No labels, no quotes, no markdown.`

export interface SpeakerNotesInput {
  eventTitle: string
  eventContent: string
  nextEventTitle?: string
}

export interface SpeakerNotesOutput {
  notes: string
}

export async function generateSpeakerNotes(
  input: SpeakerNotesInput
): Promise<SpeakerNotesOutput> {
  const { eventTitle, eventContent, nextEventTitle } = input

  const plainContent = eventContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const truncatedContent = plainContent.slice(0, 500)

  let userPrompt = `Slide Title: ${eventTitle}
Slide Content: ${truncatedContent}`

  if (nextEventTitle) {
    userPrompt += `\nNext Slide: ${nextEventTitle}`
  }

  userPrompt += `\n\nGenerate concise speaker notes for this slide.`

  const response = await callAI(SPEAKER_NOTES_SYSTEM_PROMPT, userPrompt)

  return {
    notes: response.trim(),
  }
}
