'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { SaveStatus } from '@/types'

interface UseSaveStatusOptions {
  debounceMs?: number
  maxRetries?: number
}

interface UseSaveStatusReturn {
  status: SaveStatus
  save: (saveFn: () => Promise<void>) => void
  setStatus: (status: SaveStatus) => void
}

export function useSaveStatus(
  options: UseSaveStatusOptions = {}
): UseSaveStatusReturn {
  const { debounceMs = 2000, maxRetries = 3 } = options

  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const pendingSaveRef = useRef<(() => Promise<void>) | null>(null)
  const executeSaveRef = useRef<((saveFn: () => Promise<void>) => Promise<void>) | null>(null)

  // Use ref to hold the recursive function
  useEffect(() => {
    executeSaveRef.current = async (saveFn: () => Promise<void>) => {
      setStatus('saving')
      try {
        await saveFn()
        setStatus('saved')
        retryCountRef.current = 0

        // Reset to idle after a brief delay
        setTimeout(() => {
          setStatus((current) => (current === 'saved' ? 'idle' : current))
        }, 2000)
      } catch (error) {
        console.error('Save failed:', error)

        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++
          // Retry after exponential backoff
          const delay = Math.pow(2, retryCountRef.current) * 1000
          setTimeout(() => {
            if (executeSaveRef.current) {
              executeSaveRef.current(saveFn)
            }
          }, delay)
        } else {
          setStatus('error')
          retryCountRef.current = 0
        }
      }
    }
  }, [maxRetries])

  const save = useCallback(
    (saveFn: () => Promise<void>) => {
      pendingSaveRef.current = saveFn

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (pendingSaveRef.current && executeSaveRef.current) {
          executeSaveRef.current(pendingSaveRef.current)
          pendingSaveRef.current = null
        }
      }, debounceMs)
    },
    [debounceMs]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { status, save, setStatus }
}
