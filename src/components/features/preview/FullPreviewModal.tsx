'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SlideTheme } from '@/lib/preview/themes'
import { SlidePreview } from './SlidePreview'

interface SlideEvent {
  id: string
  title: string
  content: string
}

interface SlideImage {
  thumbnailUrl: string
  fullUrl: string
  title: string
  explanation: string
}

interface FullPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  events: SlideEvent[]
  initialEventIndex: number
  theme: SlideTheme
  projectId: string
  currentEventImages: SlideImage[]
}

export function FullPreviewModal({
  isOpen,
  onClose,
  events,
  initialEventIndex,
  theme,
  projectId,
  currentEventImages,
}: FullPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialEventIndex)
  const [imageCache, setImageCache] = useState<Record<string, SlideImage[]>>({})
  const [loadingImages, setLoadingImages] = useState(false)

  // Seed cache with current event's images
  const seededRef = useRef(false)
  useEffect(() => {
    if (isOpen && events[initialEventIndex] && !seededRef.current) {
      seededRef.current = true
      setCurrentIndex(initialEventIndex)
      setImageCache({ [events[initialEventIndex].id]: currentEventImages })
    }
    if (!isOpen) {
      seededRef.current = false
    }
  }, [isOpen, initialEventIndex, events, currentEventImages])

  // Fetch images for a given event
  const fetchImagesForEvent = useCallback(
    async (eventId: string) => {
      if (imageCache[eventId]) return
      setLoadingImages(true)
      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}/images`
        )
        if (!response.ok) throw new Error('Failed to load')
        const data = await response.json()
        const images: SlideImage[] = data.images.map(
          (img: Record<string, unknown>) => ({
            thumbnailUrl: img.thumbnailUrl as string,
            fullUrl: img.fullUrl as string,
            title: (img.title as string) || '',
            explanation: (img.explanation as string) || '',
          })
        )
        setImageCache((prev) => ({ ...prev, [eventId]: images }))
      } catch {
        setImageCache((prev) => ({ ...prev, [eventId]: [] }))
      } finally {
        setLoadingImages(false)
      }
    },
    [projectId, imageCache]
  )

  // Pre-fetch images when navigating
  useEffect(() => {
    if (!isOpen || events.length === 0) return
    const event = events[currentIndex]
    if (event && !imageCache[event.id]) {
      fetchImagesForEvent(event.id)
    }
  }, [isOpen, currentIndex, events, imageCache, fetchImagesForEvent])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, events.length - 1))
  }, [events.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goNext, goPrev])

  if (!isOpen || events.length === 0) return null

  const currentEvent = events[currentIndex]
  const currentImages = imageCache[currentEvent.id] || []

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-white/70 text-sm">
          Slide {currentIndex + 1} of {events.length}
        </div>
        <div className="text-white text-sm font-medium truncate mx-4 flex-1 text-center">
          {currentEvent.title || 'Untitled Event'}
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white p-1"
          aria-label="Close preview"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center px-16 pb-6 min-h-0">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-shrink-0 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed p-2 mr-4"
          aria-label="Previous slide"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Slide */}
        <div className="flex-1 max-w-4xl">
          {loadingImages && !imageCache[currentEvent.id] ? (
            <div className="aspect-video rounded-lg bg-gray-800 flex items-center justify-center">
              <div className="text-white/50 text-sm">Loading...</div>
            </div>
          ) : (
            <SlidePreview
              title={currentEvent.title}
              content={currentEvent.content}
              images={currentImages}
              theme={theme}
            />
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          disabled={currentIndex === events.length - 1}
          className="flex-shrink-0 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed p-2 ml-4"
          aria-label="Next slide"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom slide indicator dots */}
      {events.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
