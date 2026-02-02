'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'

interface DeleteProjectDialogProps {
  isOpen: boolean
  projectTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteProjectDialog({
  isOpen,
  projectTitle,
  onClose,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Project"
      confirmText="Delete"
      variant="destructive"
      isLoading={isLoading}
    >
      <p>
        Delete <strong>{projectTitle}</strong>? This cannot be undone.
      </p>
    </Dialog>
  )
}
