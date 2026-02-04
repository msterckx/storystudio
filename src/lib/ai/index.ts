import { GenerationSettings } from './prompts'

export interface StoryEvent {
  title: string
  content: string
  suggestedDate?: string
}

export interface StoryOutline {
  title: string
  events: StoryEvent[]
}

export interface AIProvider {
  generateStory(prompt: string, settings: GenerationSettings): Promise<StoryOutline>
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: 'API_KEY_MISSING' | 'RATE_LIMITED' | 'INVALID_RESPONSE' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN'
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export function getConfiguredProvider(): 'anthropic' | 'openai' | null {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}
