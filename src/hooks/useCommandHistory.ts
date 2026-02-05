'use client'

import { useState, useCallback } from 'react'

const MAX_HISTORY = 5

function getStorageKey(projectId: string): string {
  return `storystudio:command-history:${projectId}`
}

export function useCommandHistory(projectId: string) {
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(getStorageKey(projectId))
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })

  const addCommand = useCallback(
    (command: string) => {
      setHistory((prev) => {
        // Remove duplicate if exists, then prepend
        const filtered = prev.filter((c) => c !== command)
        const updated = [command, ...filtered].slice(0, MAX_HISTORY)
        try {
          localStorage.setItem(getStorageKey(projectId), JSON.stringify(updated))
        } catch {
          // localStorage may be unavailable
        }
        return updated
      })
    },
    [projectId]
  )

  return { history, addCommand }
}
