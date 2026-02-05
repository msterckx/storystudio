'use client'

import { themes } from '@/lib/preview/themes'

interface ThemeSelectorProps {
  selectedThemeId: string
  onThemeChange: (themeId: string) => void
}

export function ThemeSelector({ selectedThemeId, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">Theme</label>
      <select
        value={selectedThemeId}
        onChange={(e) => onThemeChange(e.target.value)}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  )
}
