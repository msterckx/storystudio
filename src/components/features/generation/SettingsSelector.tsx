'use client'

import { AudienceLevel, Tone, TargetLength } from '@/lib/ai/prompts'

interface SettingsSelectorProps {
  audienceLevel: AudienceLevel
  tone: Tone
  targetLength: TargetLength
  onAudienceLevelChange: (value: AudienceLevel) => void
  onToneChange: (value: Tone) => void
  onTargetLengthChange: (value: TargetLength) => void
  disabled?: boolean
}

const audienceLevelOptions: { value: AudienceLevel; label: string }[] = [
  { value: 'elementary', label: 'Elementary School' },
  { value: 'middle_school', label: 'Middle School' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'general', label: 'General Audience' },
]

const toneOptions: { value: Tone; label: string }[] = [
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'formal', label: 'Formal' },
  { value: 'academic', label: 'Academic' },
]

const lengthOptions: { value: TargetLength; label: string; description: string }[] = [
  { value: 'brief', label: 'Brief', description: '5-7 events' },
  { value: 'standard', label: 'Standard', description: '8-12 events' },
  { value: 'detailed', label: 'Detailed', description: '13-20 events' },
]

export function SettingsSelector({
  audienceLevel,
  tone,
  targetLength,
  onAudienceLevelChange,
  onToneChange,
  onTargetLengthChange,
  disabled,
}: SettingsSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Audience Level */}
      <div>
        <label htmlFor="audience-level" className="block text-sm font-medium text-gray-700 mb-1">
          Audience
        </label>
        <select
          id="audience-level"
          value={audienceLevel}
          onChange={(e) => onAudienceLevelChange(e.target.value as AudienceLevel)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {audienceLevelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tone */}
      <div>
        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
          Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => onToneChange(e.target.value as Tone)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {toneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Length */}
      <div>
        <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
          Length
        </label>
        <select
          id="length"
          value={targetLength}
          onChange={(e) => onTargetLengthChange(e.target.value as TargetLength)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {lengthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.description})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
