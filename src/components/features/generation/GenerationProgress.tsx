'use client'

import { useEffect, useState } from 'react'

interface GenerationProgressProps {
  onCancel: () => void
}

const progressMessages = [
  'Researching your topic...',
  'Organizing key events...',
  'Writing content...',
  'Finalizing the outline...',
]

export function GenerationProgress({ onCancel }: GenerationProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % progressMessages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center py-8">
      {/* Spinner */}
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
        <svg
          className="animate-spin w-12 h-12 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Progress Message */}
      <p className="text-lg font-medium text-gray-900 mb-2">
        Generating your story
      </p>
      <p className="text-sm text-gray-500 mb-6 h-5">
        {progressMessages[messageIndex]}
      </p>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Cancel
      </button>
    </div>
  )
}
