'use client'

import { Button } from '@/components/ui/Button'

interface ExportCompleteProps {
  filename: string
  slideCount: number
  onDownloadAgain: () => void
  onClose: () => void
}

export function ExportComplete({ filename, slideCount, onDownloadAgain, onClose }: ExportCompleteProps) {
  return (
    <div className="text-center py-8">
      {/* Success icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <p className="text-lg font-medium text-gray-900 mb-1">
        Export Complete
      </p>
      <p className="text-sm text-gray-500 mb-1">
        {filename}
      </p>
      <p className="text-xs text-gray-400 mb-6">
        {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
      </p>

      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onDownloadAgain}>
          Download Again
        </Button>
      </div>
    </div>
  )
}
