'use client'

import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { Button } from '@/components/ui/Button'
import { SaveStatus } from '@/types'
import Link from 'next/link'

interface TopBarProps {
  title?: string
  onTitleChange?: (title: string) => void
  saveStatus?: SaveStatus
  showExport?: boolean
  showCommandBar?: boolean
  onCommandBarClick?: () => void
}

export function TopBar({
  title,
  onTitleChange,
  saveStatus = 'idle',
  showExport = false,
  showCommandBar = false,
  onCommandBarClick,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/projects" className="flex items-center gap-2 font-semibold text-gray-900">
        <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="hidden sm:inline">StoryStudio</span>
      </Link>

      {/* Divider */}
      {title !== undefined && <div className="h-6 w-px bg-gray-200" />}

      {/* Project Title */}
      {title !== undefined && (
        <div className="flex-1 min-w-0">
          {onTitleChange ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full truncate"
              placeholder="Untitled Project"
            />
          ) : (
            <h1 className="text-lg font-medium text-gray-900 truncate">{title}</h1>
          )}
        </div>
      )}

      {/* Spacer */}
      {title === undefined && <div className="flex-1" />}

      {/* Save Status */}
      <SaveIndicator status={saveStatus} />

      {/* Command Bar Trigger */}
      {showCommandBar && (
        <div className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCommandBarClick}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-500">⌘K</span>
          </Button>
        </div>
      )}

      {/* Export Button */}
      {showExport && (
        <Button variant="primary" size="sm">
          Export
        </Button>
      )}
    </header>
  )
}
