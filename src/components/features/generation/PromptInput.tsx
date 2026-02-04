'use client'

import { useState } from 'react'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const placeholderExamples = [
  'The Fall of the Roman Empire',
  'The American Civil Rights Movement',
  'The Discovery of DNA',
  'The French Revolution',
  'The Space Race',
]

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  // Use useState with initializer to pick random example only once
  const [randomExample] = useState(
    () => placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)]
  )

  return (
    <div>
      <label htmlFor="story-prompt" className="block text-sm font-medium text-gray-700 mb-1">
        What story do you want to create?
      </label>
      <textarea
        id="story-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., ${randomExample}`}
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
      />
      <p className="mt-1 text-xs text-gray-500">
        Describe a historical event, scientific concept, or any topic you want to explore.
      </p>
    </div>
  )
}
