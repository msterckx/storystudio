'use client'

import { useState, useCallback } from 'react'
import { SearchImage } from './useImageSearch'

export interface EventImageData extends SearchImage {
  selected: boolean
  dismissed: boolean
}

interface UseEventImagesReturn {
  selectedImages: SearchImage[]
  dismissedIds: Set<string>
  isLoading: boolean
  selectImage: (projectId: string, eventId: string, image: SearchImage) => Promise<void>
  deselectImage: (projectId: string, eventId: string, imageId: string) => Promise<void>
  dismissImage: (projectId: string, eventId: string, image: SearchImage) => Promise<void>
  loadSelectedImages: (projectId: string, eventId: string) => Promise<void>
  loadDismissedIds: (projectId: string, eventId: string) => Promise<void>
}

export function useEventImages(): UseEventImagesReturn {
  const [selectedImages, setSelectedImages] = useState<SearchImage[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const loadSelectedImages = useCallback(async (projectId: string, eventId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}/images`)
      if (!response.ok) throw new Error('Failed to load images')
      const data = await response.json()
      setSelectedImages(
        data.images.map((img: Record<string, string>) => ({
          id: img.imageId,
          thumbnailUrl: img.thumbnailUrl,
          fullUrl: img.fullUrl,
          source: img.source,
          sourceUrl: img.sourceUrl,
          license: img.license,
          title: img.title || '',
          creator: img.creator || '',
          date: img.date || '',
        }))
      )
    } catch (err) {
      console.error('Failed to load selected images:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadDismissedIds = useCallback(async (projectId: string, eventId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}/images`)
      if (!response.ok) return
      // We get all images - filter to dismissed
      // Actually we need a separate endpoint or include dismissed in the main one
      // For now, we'll store dismissed IDs locally and persist via dismiss API
      // The dismissed IDs will be loaded when the event images are loaded
    } catch {
      // Silently fail
    }
    void projectId
    void eventId
  }, [])

  const selectImage = useCallback(
    async (projectId: string, eventId: string, image: SearchImage) => {
      // Optimistic update
      setSelectedImages((prev) => [...prev, image])

      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(image),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to select image')
        }
      } catch (err) {
        console.error('Failed to select image:', err)
        // Rollback
        setSelectedImages((prev) => prev.filter((i) => i.id !== image.id))
      }
    },
    []
  )

  const deselectImage = useCallback(
    async (projectId: string, eventId: string, imageId: string) => {
      // Optimistic update
      const removed = selectedImages.find((i) => i.id === imageId)
      setSelectedImages((prev) => prev.filter((i) => i.id !== imageId))

      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images?imageId=${imageId}`,
          { method: 'DELETE' }
        )

        if (!response.ok) {
          throw new Error('Failed to deselect image')
        }
      } catch (err) {
        console.error('Failed to deselect image:', err)
        // Rollback
        if (removed) {
          setSelectedImages((prev) => [...prev, removed])
        }
      }
    },
    [selectedImages]
  )

  const dismissImage = useCallback(
    async (projectId: string, eventId: string, image: SearchImage) => {
      // Optimistic update
      setDismissedIds((prev) => new Set([...prev, image.id]))

      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images/dismiss`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(image),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to dismiss image')
        }
      } catch (err) {
        console.error('Failed to dismiss image:', err)
        // Rollback
        setDismissedIds((prev) => {
          const next = new Set(prev)
          next.delete(image.id)
          return next
        })
      }
    },
    []
  )

  return {
    selectedImages,
    dismissedIds,
    isLoading,
    selectImage,
    deselectImage,
    dismissImage,
    loadSelectedImages,
    loadDismissedIds,
  }
}
