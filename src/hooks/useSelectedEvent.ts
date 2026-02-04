'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UseSelectedEventReturn {
  selectedEventId: string | null
  selectEvent: (eventId: string | null) => void
}

export function useSelectedEvent(): UseSelectedEventReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedEventId = searchParams.get('event')

  const selectEvent = useCallback(
    (eventId: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (eventId) {
        params.set('event', eventId)
      } else {
        params.delete('event')
      }

      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    selectedEventId,
    selectEvent,
  }
}
