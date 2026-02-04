'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface RegenerateModalProps {
  isOpen: boolean
  onSubmit: (instructions: string) => void
  onCancel: () => void
}

export function RegenerateModal({
  isOpen,
  onSubmit,
  onCancel,
}: RegenerateModalProps) {
  const [instructions, setInstructions] = useState('')

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInstructions('')
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

  const handleSubmit = () => {
    if (instructions.trim()) {
      const value = instructions.trim()
      setInstructions('')
      onSubmit(value)
    }
  }

  const handleCancel = () => {
    setInstructions('')
    onCancel()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Regenerate Content">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Provide instructions for how you want the content to be regenerated.
        </p>

        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Focus more on the economic impact, add specific dates, make it more dramatic..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!instructions.trim()}>
            Generate
          </Button>
        </div>
      </div>
    </Modal>
  )
}
