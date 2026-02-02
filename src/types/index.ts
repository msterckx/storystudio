export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface ProjectSettings {
  audienceLevel?: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'general'
  tone?: 'formal' | 'conversational' | 'academic' | 'storytelling'
  targetLength?: 'brief' | 'standard' | 'detailed'
  theme?: string
}

export interface EventMetadata {
  date?: string
  tags?: string[]
  notes?: string
}
