'use client'

interface ExportProgressProps {
  current: number
  total: number
  message: string
}

export function ExportProgress({ current, total, message }: ExportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

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

      <p className="text-lg font-medium text-gray-900 mb-2">
        Exporting Presentation
      </p>
      <p className="text-sm text-gray-500 mb-4 h-5">
        {message || 'Preparing export...'}
      </p>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
