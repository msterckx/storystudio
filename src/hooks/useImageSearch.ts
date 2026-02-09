'use client'

import { useState, useCallback, useRef } from 'react'

export interface SearchImage {
  id: string
  thumbnailUrl: string
  fullUrl: string
  source: string
  sourceUrl: string
  license: string
  title: string
  creator: string
  description: string
  date: string
  relevanceScore?: number
  relevanceReason?: string
}

interface UseImageSearchReturn {
  images: SearchImage[]
  isLoading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  smartSearch: (eventTitle: string, eventContent: string) => Promise<void>
}

export function useImageSearch(): UseImageSearchReturn {
  const [images, setImages] = useState<SearchImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (query: string) => {
    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (!query.trim()) {
      setImages([])
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ query, limit: '12' })
      const response = await fetch(`/api/images/search?${params}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to search images')
      }

      const data = await response.json()
      setImages(data.images)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Search failed')
      setImages([])
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [])

  const smartSearch = useCallback(async (eventTitle: string, eventContent: string) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (!eventTitle.trim()) {
      setImages([])
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ eventTitle, eventContent })
      const response = await fetch(`/api/images/search-smart?${params}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to search images')
      }

      const data = await response.json()
      setImages(data.images)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Search failed')
      setImages([])
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [])

  return { images, isLoading, error, search, smartSearch }
}
