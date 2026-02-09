'use server'

import { callAI } from './call-ai'

const SYSTEM_PROMPT = `You are an image research specialist for Wikimedia Commons. Given an educational event title and content, generate 3-4 specific search queries optimized for finding relevant images on Wikimedia Commons.

Each query should target a different visual angle:
- Key figures or people involved
- Locations, architecture, or geography
- Artwork, paintings, or illustrations depicting the event
- Artifacts, maps, or documents

Guidelines:
- Use specific names, dates, and terms that would match Wikimedia file titles
- Include terms like "painting", "map", "portrait", "photograph" where appropriate
- Avoid generic terms; be as specific as possible
- Each query should be 3-6 words

Respond with ONLY a JSON array of strings, no other text. Example:
["Sack of Rome 410 Visigoths painting", "Roman Empire decline map", "Romulus Augustulus last emperor", "Rome barbarian invasion artwork"]`

export async function generateImageSearchQueries(
  eventTitle: string,
  eventContent: string
): Promise<string[]> {
  const truncatedContent = eventContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)

  const userPrompt = `Event title: ${eventTitle}\n\nEvent content: ${truncatedContent}`

  try {
    const response = await callAI(SYSTEM_PROMPT, userPrompt)

    // Extract JSON array from the response
    const match = response.match(/\[[\s\S]*\]/)
    if (!match) {
      console.error('Failed to parse AI search queries:', response)
      return [eventTitle]
    }

    const queries = JSON.parse(match[0]) as string[]
    if (!Array.isArray(queries) || queries.length === 0) {
      return [eventTitle]
    }

    return queries.slice(0, 4)
  } catch (error) {
    console.error('AI image search query generation failed:', error)
    return [eventTitle]
  }
}
