'use client'

import { ExportOptions as ExportOptionsType } from '@/types/export'
import { themes } from '@/lib/preview/themes'

interface ExportOptionsProps {
  options: ExportOptionsType
  onOptionChange: <K extends keyof ExportOptionsType>(key: K, value: ExportOptionsType[K]) => void
}

const checkboxOptions: Array<{
  key: keyof ExportOptionsType
  label: string
  description?: string
}> = [
  { key: 'includeTitleSlide', label: 'Title slide' },
  { key: 'includeTableOfContents', label: 'Table of contents' },
  { key: 'includeSpeakerNotes', label: 'Speaker notes', description: 'AI-generated' },
  { key: 'includeImageCaptions', label: 'Image captions' },
  { key: 'includeCreditsSlide', label: 'Credits slide' },
]

export function ExportOptions({ options, onOptionChange }: ExportOptionsProps) {
  return (
    <div className="space-y-5">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Theme
        </label>
        <select
          value={options.theme}
          onChange={(e) => onOptionChange('theme', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      {/* Include options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Include in export
        </label>
        <div className="space-y-2.5">
          {checkboxOptions.map(({ key, label, description }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options[key] as boolean}
                onChange={(e) => onOptionChange(key, e.target.checked as never)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
              {description && (
                <span className="text-xs text-gray-400">({description})</span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
