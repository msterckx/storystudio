'use client'

import { useState, useCallback } from 'react'
import { SearchImage } from './useImageSearch'

export interface SelectedImageData extends SearchImage {
  explanation: string
  explanationLocked: boolean
  orderIndex: number
}

interface UseEventImagesReturn {
  selectedImages: SelectedImageData[]
  dismissedIds: Set<string>
  isLoading: boolean
  selectImage: (projectId: string, eventId: string, image: SearchImage) => Promise<void>
  deselectImage: (projectId: string, eventId: string, imageId: string) => Promise<void>
  dismissImage: (projectId: string, eventId: string, image: SearchImage) => Promise<void>
  updateImageExplanation: (projectId: string, eventId: string, imageId: string, explanation: string) => Promise<void>
  toggleExplanationLock: (projectId: string, eventId: string, imageId: string, locked: boolean) => Promise<void>
  loadSelectedImages: (projectId: string, eventId: string) => Promise<void>
  setSelectedImages: React.Dispatch<React.SetStateAction<SelectedImageData[]>>
}

export function useEventImages(): UseEventImagesReturn {
  const [selectedImages, setSelectedImages] = useState<SelectedImageData[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const loadSelectedImages = useCallback(async (projectId: string, eventId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/events/${eventId}/images`)
      if (!response.ok) throw new Error('Failed to load images')
      const data = await response.json()
      setSelectedImages(
        data.images.map((img: Record<string, unknown>) => ({
          id: img.imageId,
          thumbnailUrl: img.thumbnailUrl,
          fullUrl: img.fullUrl,
          source: img.source,
          sourceUrl: img.sourceUrl,
          license: img.license,
          title: img.title || '',
          creator: img.creator || '',
          date: img.date || '',
          explanation: img.explanation || '',
          explanationLocked: img.explanationLocked || false,
          orderIndex: img.orderIndex || 0,
        }))
      )
    } catch (err) {
      console.error('Failed to load selected images:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectImage = useCallback(
    async (projectId: string, eventId: string, image: SearchImage) => {
      // Optimistic update
      const newSelected: SelectedImageData = {
        ...image,
        explanation: '',
        explanationLocked: false,
        orderIndex: selectedImages.length,
      }
      setSelectedImages((prev) => [...prev, newSelected])

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
    [selectedImages.length]
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
        setDismissedIds((prev) => {
          const next = new Set(prev)
          next.delete(image.id)
          return next
        })
      }
    },
    []
  )

  const updateImageExplanation = useCallback(
    async (projectId: string, eventId: string, imageId: string, explanation: string) => {
      // Optimistic update
      setSelectedImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, explanation } : img))
      )

      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, explanation }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to update explanation')
        }
      } catch (err) {
        console.error('Failed to update explanation:', err)
      }
    },
    []
  )

  const toggleExplanationLock = useCallback(
    async (projectId: string, eventId: string, imageId: string, locked: boolean) => {
      // Optimistic update
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, explanationLocked: locked } : img
        )
      )

      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, explanationLocked: locked }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to toggle lock')
        }
      } catch (err) {
        console.error('Failed to toggle lock:', err)
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
    updateImageExplanation,
    toggleExplanationLock,
    loadSelectedImages,
    setSelectedImages,
  }
}
