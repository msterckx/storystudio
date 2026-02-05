'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useImageSearch, SearchImage } from '@/hooks/useImageSearch'
import { useEventImages } from '@/hooks/useEventImages'
import { extractSearchTerms } from '@/lib/images/search-terms'
import { ImageGrid } from './ImageGrid'
import { SelectedImages } from './SelectedImages'
import { ImageSkeleton } from './ImageSkeleton'

interface ImagePanelProps {
  projectId: string
  eventId: string | null
  eventTitle: string
  eventContent: string
}

export function ImagePanel({ projectId, eventId, eventTitle, eventContent }: ImagePanelProps) {
  const { images, isLoading: searchLoading, search } = useImageSearch()
  const {
    selectedImages,
    dismissedIds,
    isLoading: imagesLoading,
    selectImage,
    deselectImage,
    dismissImage,
    loadSelectedImages,
  } = useEventImages()

  const [activeTab, setActiveTab] = useState<'images' | 'preview'>('images')
  const lastSearchRef = useRef<string>('')

  // Load selected images when event changes
  useEffect(() => {
    if (eventId && projectId) {
      loadSelectedImages(projectId, eventId)
    }
  }, [eventId, projectId, loadSelectedImages])

  // Search when event changes
  useEffect(() => {
    if (!eventId || !eventTitle) return

    const terms = extractSearchTerms(eventTitle, eventContent)
    if (terms && terms !== lastSearchRef.current) {
      lastSearchRef.current = terms
      search(terms)
    }
  }, [eventId, eventTitle, eventContent, search])

  const handleSelect = useCallback(
    (image: SearchImage) => {
      if (!eventId) return
      selectImage(projectId, eventId, image)
    },
    [projectId, eventId, selectImage]
  )

  const handleDeselect = useCallback(
    (imageId: string) => {
      if (!eventId) return
      deselectImage(projectId, eventId, imageId)
    },
    [projectId, eventId, deselectImage]
  )

  const handleDismiss = useCallback(
    (image: SearchImage) => {
      if (!eventId) return
      dismissImage(projectId, eventId, image)
    },
    [projectId, eventId, dismissImage]
  )

  // Build selected IDs set
  const selectedIds = new Set(selectedImages.map((i) => i.id))

  // Filter out dismissed and already selected images from search results
  const filteredImages = images.filter(
    (img) => !dismissedIds.has(img.id) && !selectedIds.has(img.id)
  )

  if (!eventId) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md">
              Images
            </button>
            <button className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
              Preview
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-500">Select an event to discover images</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md ${
              activeTab === 'images'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-3 py-1.5 text-sm rounded-md ${
              activeTab === 'preview'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'images' ? (
          <div>
            {/* Selected images */}
            <SelectedImages images={selectedImages} onRemove={handleDeselect} />

            {/* Search results */}
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Candidates
            </h4>

            {searchLoading || imagesLoading ? (
              <ImageSkeleton />
            ) : (
              <ImageGrid
                images={filteredImages}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onDismiss={handleDismiss}
              />
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500">
              Slide preview will appear here in Phase 10.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
