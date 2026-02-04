export type AudienceLevel = 'elementary' | 'middle_school' | 'high_school' | 'college' | 'general'
export type Tone = 'formal' | 'conversational' | 'academic' | 'storytelling'
export type TargetLength = 'brief' | 'standard' | 'detailed'

export interface GenerationSettings {
  audienceLevel: AudienceLevel
  tone: Tone
  targetLength: TargetLength
}

const audienceLevelDescriptions: Record<AudienceLevel, string> = {
  elementary: 'Elementary school (ages 6-10): Use simple vocabulary, short sentences, and concrete examples.',
  middle_school: 'Middle school (ages 11-13): Use moderate vocabulary, explain complex concepts clearly.',
  high_school: 'High school (ages 14-17): Use more sophisticated vocabulary, include nuanced analysis.',
  college: 'College level: Use academic vocabulary, include detailed analysis and multiple perspectives.',
  general: 'General audience: Accessible to adults, balanced complexity.',
}

const toneDescriptions: Record<Tone, string> = {
  formal: 'Formal and objective, like a textbook or encyclopedia.',
  conversational: 'Friendly and engaging, like a knowledgeable friend explaining.',
  academic: 'Scholarly and analytical, with attention to sources and evidence.',
  storytelling: 'Narrative and immersive, bringing events to life with vivid details.',
}

const lengthTargets: Record<TargetLength, { min: number; max: number; description: string }> = {
  brief: { min: 5, max: 7, description: '5-7 events for a quick overview' },
  standard: { min: 8, max: 12, description: '8-12 events for comprehensive coverage' },
  detailed: { min: 13, max: 20, description: '13-20 events for in-depth exploration' },
}

export function buildSystemPrompt(settings: GenerationSettings): string {
  const audience = audienceLevelDescriptions[settings.audienceLevel]
  const tone = toneDescriptions[settings.tone]
  const length = lengthTargets[settings.targetLength]

  return `You are an educational content creator specializing in creating structured story outlines for learning.

Your task is to generate a story outline that can be used as an educational presentation.

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "title": "A clear, descriptive title for the story",
  "events": [
    {
      "title": "Event title (max 60 characters)",
      "content": "2-4 paragraphs of educational content about this event",
      "suggestedDate": "Optional: relevant date or time period"
    }
  ]
}

GUIDELINES:
- Audience: ${audience}
- Tone: ${tone}
- Length: Generate ${length.description}
- Events must be chronologically ordered when applicable
- Each event should be a distinct, meaningful unit of information
- Content should be factually accurate and educational
- Avoid filler events or redundant information
- Each event's content should be substantial enough to fill a presentation slide

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation before or after.`
}

export function buildUserPrompt(topic: string): string {
  return `Create an educational story outline about: ${topic}`
}
