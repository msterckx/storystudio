'use client'

interface EventStateIndicatorsProps {
  source: 'ai' | 'user'
  locked: boolean
  className?: string
}

export function EventStateIndicators({
  source,
  locked,
  className = '',
}: EventStateIndicatorsProps) {
  if (source === 'user' && !locked) return null

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {source === 'ai' && (
        <span
          className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded"
          aria-label="AI-generated"
        >
          AI
        </span>
      )}
      {locked && (
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-label="Locked"
        >
          <title>Locked</title>
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )
}
