import { callAI } from './call-ai'
import { AIError } from './index'

const SPLIT_SYSTEM_PROMPT = `You are an educational content organizer. Your task is to split a single event into 2-3 distinct, meaningful events.

Guidelines:
- Each new event should cover a distinct aspect or sub-topic
- Preserve all original information
- Each event should have enough content to stand alone
- Events should be in logical/chronological order
- Keep titles concise (max 60 characters)

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Event title",
    "content": "Event content"
  }
]

No explanations, no markdown code blocks - just the JSON array.`

export interface SplitInput {
  eventTitle: string
  currentContent: string
}

export interface SplitEvent {
  title: string
  content: string
}

export interface SplitOutput {
  events: SplitEvent[]
}

export async function splitContent(input: SplitInput): Promise<SplitOutput> {
  const userPrompt = `Original Event Title: "${input.eventTitle}"

Content to Split:
${input.currentContent}

Split this into 2-3 distinct events.`

  const response = await callAI(SPLIT_SYSTEM_PROMPT, userPrompt)

  // Parse the JSON response
  let jsonText = response.trim()

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const parsed = JSON.parse(jsonText)

    if (!Array.isArray(parsed) || parsed.length < 2) {
      throw new Error('Expected array with at least 2 events')
    }

    const events: SplitEvent[] = parsed.map((event: Record<string, unknown>, index: number) => {
      if (!event.title || typeof event.title !== 'string') {
        throw new Error(`Event ${index} missing title`)
      }
      if (!event.content || typeof event.content !== 'string') {
        throw new Error(`Event ${index} missing content`)
      }

      return {
        title: String(event.title).slice(0, 100),
        content: String(event.content),
      }
    })

    return { events }
  } catch (error) {
    console.error('Failed to parse split response:', error)
    console.error('Response text:', response.slice(0, 500))
    throw new AIError(
      'Could not parse the AI response. Please try again.',
      'INVALID_RESPONSE'
    )
  }
}
