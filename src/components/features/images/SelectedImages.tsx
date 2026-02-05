'use client'

import { useState, useCallback, useRef } from 'react'
import { SelectedImageData } from '@/hooks/useEventImages'

interface SelectedImagesProps {
  images: SelectedImageData[]
  onRemove: (imageId: string) => void
  onInspect: (image: SelectedImageData) => void
  onExplanationChange: (imageId: string, explanation: string) => void
  onToggleLock: (imageId: string, locked: boolean) => void
  onRegenerateExplanation: (image: SelectedImageData) => void
  isGeneratingExplanation: string | null
}

export function SelectedImages({
  images,
  onRemove,
  onInspect,
  onExplanationChange,
  onToggleLock,
  onRegenerateExplanation,
  isGeneratingExplanation,
}: SelectedImagesProps) {
  if (images.length === 0) return null

  return (
    <div className="mb-4">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Selected ({images.length})
      </h4>
      <div className="space-y-3">
        {images.map((image) => (
          <SelectedImageCard
            key={image.id}
            image={image}
            onRemove={() => onRemove(image.id)}
            onInspect={() => onInspect(image)}
            onExplanationChange={(explanation) =>
              onExplanationChange(image.id, explanation)
            }
            onToggleLock={(locked) => onToggleLock(image.id, locked)}
            onRegenerateExplanation={() => onRegenerateExplanation(image)}
            isGenerating={isGeneratingExplanation === image.id}
          />
        ))}
      </div>
    </div>
  )
}

function SelectedImageCard({
  image,
  onRemove,
  onInspect,
  onExplanationChange,
  onToggleLock,
  onRegenerateExplanation,
  isGenerating,
}: {
  image: SelectedImageData
  onRemove: () => void
  onInspect: () => void
  onExplanationChange: (explanation: string) => void
  onToggleLock: (locked: boolean) => void
  onRegenerateExplanation: () => void
  isGenerating: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const [localExplanation, setLocalExplanation] = useState(image.explanation)
  const [isEditing, setIsEditing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleExplanationChange = useCallback(
    (value: string) => {
      setLocalExplanation(value)
      setIsEditing(true)
      // Debounce save
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onExplanationChange(value)
        setIsEditing(false)
        debounceRef.current = null
      }, 1000)
    },
    [onExplanationChange]
  )

  // Sync local state when external changes come in (e.g. regeneration)
  if (image.explanation !== localExplanation && !isEditing) {
    setLocalExplanation(image.explanation)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Thumbnail */}
        <button
          onClick={onInspect}
          className="flex-shrink-0 w-20 h-20 bg-gray-100"
        >
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.thumbnailUrl}
              alt={image.title || 'Selected image'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 p-2 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-medium text-gray-900 truncate">
              {image.title || 'Untitled'}
            </p>
            <button
              onClick={onRemove}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 p-0.5"
              aria-label="Remove image"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400">{image.source}</p>
        </div>
      </div>

      {/* Explanation section */}
      <div className="px-2 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            Explanation
          </span>
          <div className="flex items-center gap-1">
            {/* Regenerate */}
            {!image.explanationLocked && (
              <button
                onClick={onRegenerateExplanation}
                disabled={isGenerating}
                className="text-gray-400 hover:text-blue-500 p-0.5 disabled:opacity-50"
                aria-label="Regenerate explanation"
              >
                {isGenerating ? (
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}

            {/* Lock toggle */}
            <button
              onClick={() => onToggleLock(!image.explanationLocked)}
              className={`p-0.5 ${image.explanationLocked ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label={image.explanationLocked ? 'Unlock explanation' : 'Lock explanation'}
            >
              {image.explanationLocked ? (
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <textarea
          value={localExplanation}
          onChange={(e) => handleExplanationChange(e.target.value)}
          disabled={image.explanationLocked}
          placeholder={isGenerating ? 'Generating explanation...' : 'Add an explanation for this image...'}
          rows={2}
          className="w-full px-2 py-1 text-xs rounded border border-gray-200 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}
