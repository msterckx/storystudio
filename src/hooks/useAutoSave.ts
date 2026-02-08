'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SaveStatus } from '@/types'

interface UseAutoSaveOptions {
  delay?: number
  onSave: () => Promise<void>
}

interface UseAutoSaveReturn {
  status: SaveStatus
  triggerSave: () => void
  forceSave: () => void
}

export function useAutoSave({ delay = 2000, onSave }: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingRef = useRef(false)

  const executeSave = useCallback(async () => {
    if (!pendingRef.current) return

    pendingRef.current = false
    setStatus('saving')

    try {
      await onSave()
      setStatus('saved')

      // Reset to idle after showing "Saved"
      setTimeout(() => {
        setStatus((current) => (current === 'saved' ? 'idle' : current))
      }, 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setStatus('error')
    }
  }, [onSave])

  const triggerSave = useCallback(() => {
    pendingRef.current = true

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(executeSave, delay)
  }, [delay, executeSave])

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingRef.current = true
    executeSave()
  }, [executeSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { status, triggerSave, forceSave }
}
