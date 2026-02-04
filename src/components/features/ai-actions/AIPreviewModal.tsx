'use client'

import { useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface AIPreviewModalProps {
  isOpen: boolean
  title: string
  originalContent: string
  newContent: string
  onApply: () => void
  onCancel: () => void
}

export function AIPreviewModal({
  isOpen,
  title,
  originalContent,
  newContent,
  onApply,
  onCancel,
}: AIPreviewModalProps) {
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
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {/* Comparison view */}
        <div className="grid grid-cols-2 gap-4">
          {/* Original */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current</h4>
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-64 overflow-y-auto border border-gray-200">
              <div className="whitespace-pre-wrap">{originalContent || '(empty)'}</div>
            </div>
          </div>

          {/* New */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Proposed</h4>
            <div className="bg-blue-50 rounded-md p-3 text-sm text-gray-700 max-h-64 overflow-y-auto border border-blue-200">
              <div className="whitespace-pre-wrap">{newContent}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onApply}>Apply Changes</Button>
        </div>
      </div>
    </Modal>
  )
}
