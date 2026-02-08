'use client'

interface LockToggleProps {
  isLocked: boolean
  onToggle: () => void
}

export function LockToggle({ isLocked, onToggle }: LockToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isLocked}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
        transition-colors
        ${
          isLocked
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
      title={isLocked ? 'Unlock event' : 'Lock event'}
    >
      {isLocked ? (
        <>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Locked</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
          </svg>
          <span>Unlocked</span>
        </>
      )}
    </button>
  )
}
