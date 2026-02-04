'use client'

import { useState, useCallback, useRef } from 'react'

export type AIActionStatus = 'idle' | 'loading' | 'preview' | 'error'

export interface UseAIActionReturn<TResult> {
  status: AIActionStatus
  result: TResult | null
  error: string | null
  execute: () => Promise<void>
  apply: () => void
  cancel: () => void
}

export function useAIAction<TResult>(
  actionFn: () => Promise<TResult>,
  onApply: (result: TResult) => void
): UseAIActionReturn<TResult> {
  const [status, setStatus] = useState<AIActionStatus>('idle')
  const [result, setResult] = useState<TResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async () => {
    setStatus('loading')
    setError(null)

    abortControllerRef.current = new AbortController()

    try {
      const output = await actionFn()

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        setStatus('idle')
        return
      }

      setResult(output)
      setStatus('preview')
    } catch (e) {
      if (abortControllerRef.current?.signal.aborted) {
        setStatus('idle')
        return
      }

      setError(e instanceof Error ? e.message : 'An error occurred')
      setStatus('error')
    } finally {
      abortControllerRef.current = null
    }
  }, [actionFn])

  const apply = useCallback(() => {
    if (result) {
      onApply(result)
    }
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [result, onApply])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, execute, apply, cancel }
}
