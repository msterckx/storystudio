'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useImageSearch, SearchImage } from '@/hooks/useImageSearch'
import { useEventImages, SelectedImageData } from '@/hooks/useEventImages'
import { useSlidePreview } from '@/hooks/useSlidePreview'
import { extractSearchTerms } from '@/lib/images/search-terms'
import { getThemeById } from '@/lib/preview/themes'
import { ImageGrid } from './ImageGrid'
import { SelectedImages } from './SelectedImages'
import { ImageSkeleton } from './ImageSkeleton'
import { ImageInspector } from './ImageInspector'
import { SlidePreview } from '../preview/SlidePreview'
import { ThemeSelector } from '../preview/ThemeSelector'
import { FullPreviewModal } from '../preview/FullPreviewModal'

interface SlideEvent {
  id: string
  title: string
  content: string
}

interface ImagePanelProps {
  projectId: string
  eventId: string | null
  eventTitle: string
  eventContent: string
  events?: SlideEvent[]
  projectSettings?: string
  onSettingsChange?: (settings: Record<string, unknown>) => void
  customSearchQuery?: string | null
  onSearchQueryUsed?: () => void
}

export function ImagePanel({
  projectId,
  eventId,
  eventTitle,
  eventContent,
  events = [],
  projectSettings = '{}',
  onSettingsChange,
  customSearchQuery,
  onSearchQueryUsed,
}: ImagePanelProps) {
  const { images, isLoading: searchLoading, search } = useImageSearch()
  const {
    selectedImages,
    dismissedIds,
    isLoading: imagesLoading,
    selectImage,
    deselectImage,
    dismissImage,
    updateImageExplanation,
    toggleExplanationLock,
    loadSelectedImages,
    setSelectedImages,
  } = useEventImages()

  const [activeTab, setActiveTab] = useState<'images' | 'preview'>('images')
  const [inspectedImage, setInspectedImage] = useState<SearchImage | null>(null)
  const [inspectedIsSelected, setInspectedIsSelected] = useState(false)
  const [generatingExplanationId, setGeneratingExplanationId] = useState<string | null>(null)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const lastSearchRef = useRef<string>('')

  // Theme management
  const parsedSettingsRef = useRef<Record<string, unknown>>({})
  try {
    parsedSettingsRef.current = JSON.parse(projectSettings) as Record<string, unknown>
  } catch {
    parsedSettingsRef.current = {}
  }
  const [themeId, setThemeId] = useState<string>(
    (parsedSettingsRef.current.themeId as string) || 'academic'
  )
  const theme = getThemeById(themeId)

  // Debounced preview data
  const previewData = useSlidePreview(eventTitle, eventContent)

  const handleThemeChange = useCallback(
    (newThemeId: string) => {
      setThemeId(newThemeId)
      if (onSettingsChange) {
        onSettingsChange({ ...parsedSettingsRef.current, themeId: newThemeId })
      }
    },
    [onSettingsChange]
  )

  // Current event index for full preview
  const currentEventIndex = events.findIndex((e) => e.id === eventId)

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

  // Handle custom search query from command bar
  useEffect(() => {
    if (customSearchQuery && eventId) {
      lastSearchRef.current = customSearchQuery
      search(customSearchQuery)
      setActiveTab('images')
      onSearchQueryUsed?.()
    }
  }, [customSearchQuery, eventId, search, onSearchQueryUsed])

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

  const handleExplanationChange = useCallback(
    (imageId: string, explanation: string) => {
      if (!eventId) return
      updateImageExplanation(projectId, eventId, imageId, explanation)
    },
    [projectId, eventId, updateImageExplanation]
  )

  const handleToggleLock = useCallback(
    (imageId: string, locked: boolean) => {
      if (!eventId) return
      toggleExplanationLock(projectId, eventId, imageId, locked)
    },
    [projectId, eventId, toggleExplanationLock]
  )

  const handleRegenerateExplanation = useCallback(
    async (image: SelectedImageData) => {
      if (!eventId || image.explanationLocked) return

      setGeneratingExplanationId(image.id)

      try {
        const response = await fetch('/api/ai/image-explanation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageMetadata: {
              title: image.title,
              creator: image.creator,
              date: image.date,
              source: image.source,
            },
            eventTitle,
            eventContent,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate explanation')
        }

        const data = await response.json()

        // Update local state
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, explanation: data.explanation } : img
          )
        )

        // Persist to database
        if (eventId) {
          updateImageExplanation(projectId, eventId, image.id, data.explanation)
        }
      } catch (err) {
        console.error('Failed to generate explanation:', err)
      } finally {
        setGeneratingExplanationId(null)
      }
    },
    [eventId, eventTitle, eventContent, projectId, updateImageExplanation, setSelectedImages]
  )

  // Inspector handlers
  const handleInspectFromGrid = useCallback((image: SearchImage) => {
    setInspectedImage(image)
    setInspectedIsSelected(false)
  }, [])

  const handleInspectFromSelected = useCallback((image: SelectedImageData) => {
    setInspectedImage(image)
    setInspectedIsSelected(true)
  }, [])

  const handleInspectorSelect = useCallback(() => {
    if (inspectedImage) {
      handleSelect(inspectedImage)
      setInspectedImage(null)
    }
  }, [inspectedImage, handleSelect])

  const handleInspectorDismiss = useCallback(() => {
    if (inspectedImage) {
      handleDismiss(inspectedImage)
      setInspectedImage(null)
    }
  }, [inspectedImage, handleDismiss])

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
            {/* Selected images with explanations */}
            <SelectedImages
              images={selectedImages}
              onRemove={handleDeselect}
              onInspect={handleInspectFromSelected}
              onExplanationChange={handleExplanationChange}
              onToggleLock={handleToggleLock}
              onRegenerateExplanation={handleRegenerateExplanation}
              isGeneratingExplanation={generatingExplanationId}
            />

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
                onInspect={handleInspectFromGrid}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Theme selector */}
            <div className="flex items-center justify-between">
              <ThemeSelector
                selectedThemeId={themeId}
                onThemeChange={handleThemeChange}
              />
              <button
                onClick={() => setShowFullPreview(true)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.28 2.22a.75.75 0 00-1.06 1.06L5.44 6.5H2.75a.75.75 0 000 1.5h4.5A.75.75 0 008 7.25v-4.5a.75.75 0 00-1.5 0v2.69L3.28 2.22zM13.5 2.75a.75.75 0 00-1.5 0v4.5c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-2.69l3.22-3.22a.75.75 0 00-1.06-1.06L13.5 5.44V2.75zM3.28 17.78a.75.75 0 01-1.06-1.06L5.44 13.5H2.75a.75.75 0 010-1.5h4.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.22 3.22zM13.5 17.25a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 101.06 1.06l3.22-3.22v2.69z" />
                </svg>
                Full Preview
              </button>
            </div>

            {/* Slide preview */}
            <SlidePreview
              title={previewData.title}
              content={previewData.content}
              images={selectedImages.map((img) => ({
                thumbnailUrl: img.thumbnailUrl,
                fullUrl: img.fullUrl,
                title: img.title,
                explanation: img.explanation,
              }))}
              theme={theme}
            />

            {/* Layout info */}
            <p className="text-[10px] text-gray-400 text-center">
              {selectedImages.length === 0
                ? 'Text-only layout'
                : selectedImages.length === 1
                  ? eventContent.length < 200
                    ? 'Image-focused layout'
                    : 'Text + image layout'
                  : `Text + ${Math.min(selectedImages.length, 3)} images layout`}
            </p>
          </div>
        )}
      </div>

      {/* Image Inspector */}
      {inspectedImage && (
        <ImageInspector
          image={inspectedImage}
          isOpen={true}
          onClose={() => setInspectedImage(null)}
          onSelect={inspectedIsSelected ? undefined : handleInspectorSelect}
          onDismiss={inspectedIsSelected ? undefined : handleInspectorDismiss}
          isSelected={inspectedIsSelected}
        />
      )}

      {/* Full Preview Modal */}
      <FullPreviewModal
        isOpen={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        events={events}
        initialEventIndex={currentEventIndex >= 0 ? currentEventIndex : 0}
        theme={theme}
        projectId={projectId}
        currentEventImages={selectedImages.map((img) => ({
          thumbnailUrl: img.thumbnailUrl,
          fullUrl: img.fullUrl,
          title: img.title,
          explanation: img.explanation,
        }))}
      />
    </div>
  )
}
