'use client'

import { useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface SplitEvent {
  title: string
  content: string
}

interface SplitPreviewModalProps {
  isOpen: boolean
  originalTitle: string
  originalContent: string
  proposedEvents: SplitEvent[]
  onApply: () => void
  onCancel: () => void
}

export function SplitPreviewModal({
  isOpen,
  originalTitle,
  originalContent,
  proposedEvents,
  onApply,
  onCancel,
}: SplitPreviewModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [onCancel]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Split Event Preview">
      <div className="space-y-4">
        {/* Original */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Original: {originalTitle}
          </h4>
          <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-32 overflow-y-auto border border-gray-200">
            <div className="whitespace-pre-wrap line-clamp-4">
              {originalContent || '(empty)'}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <svg
            className="w-6 h-6 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>

        {/* Proposed events */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Will be split into {proposedEvents.length} events:
          </h4>
          <div className="space-y-3">
            {proposedEvents.map((event, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-md p-3 border border-blue-200"
              >
                <h5 className="font-medium text-gray-900 mb-1">
                  {index + 1}. {event.title}
                </h5>
                <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                  {event.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onApply}>Apply Split</Button>
        </div>
      </div>
    </Modal>
  )
}
