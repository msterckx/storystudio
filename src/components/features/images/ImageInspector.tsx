'use client'

import { useEffect, useCallback, useState } from 'react'
import { useImageZoom } from '@/hooks/useImageZoom'
import { SearchImage } from '@/hooks/useImageSearch'
import { Button } from '@/components/ui/Button'

interface ImageInspectorProps {
  image: SearchImage
  isOpen: boolean
  onClose: () => void
  onSelect?: () => void
  onDismiss?: () => void
  isSelected?: boolean
}

export function ImageInspector({
  image,
  isOpen,
  onClose,
  onSelect,
  onDismiss,
  isSelected,
}: ImageInspectorProps) {
  const {
    zoom,
    position,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomPercentage,
  } = useImageZoom()

  const [imgError, setImgError] = useState(false)

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex">
      {/* Image viewer area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white text-sm font-medium truncate max-w-md">
            {image.title || 'Image'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-1">
              <button
                onClick={zoomOut}
                className="text-white hover:text-gray-300 p-1"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-white text-xs min-w-[3rem] text-center">
                {zoomPercentage}%
              </span>
              <button
                onClick={zoomIn}
                className="text-white hover:text-gray-300 p-1"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="text-white hover:text-gray-300 p-1 ml-1"
                aria-label="Reset zoom"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 p-2"
              aria-label="Close"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image display */}
        <div
          className="flex-1 overflow-hidden flex items-center justify-center"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        >
          {imgError ? (
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p>Failed to load image</p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.fullUrl}
              alt={image.title || 'Image'}
              className="max-h-full max-w-full select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              draggable={false}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-3 p-4">
          {!isSelected && onSelect && (
            <Button onClick={onSelect}>Select</Button>
          )}
          {onDismiss && (
            <Button variant="secondary" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </div>

      {/* Metadata sidebar */}
      <div className="w-72 bg-gray-900 border-l border-gray-700 overflow-y-auto p-4">
        <h3 className="text-white text-sm font-medium mb-4">Image Details</h3>

        <div className="space-y-4">
          {image.title && (
            <MetadataField label="Title" value={image.title} />
          )}
          {image.description && (
            <MetadataField label="Description" value={image.description} />
          )}
          {image.relevanceReason && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Why this image</p>
              <p className="text-sm text-gray-200 italic">{image.relevanceReason}</p>
            </div>
          )}
          {image.creator && (
            <MetadataField label="Creator" value={image.creator} />
          )}
          {image.date && (
            <MetadataField label="Date" value={image.date} />
          )}
          <MetadataField label="Source" value={image.source} />
          {image.license && (
            <MetadataField label="License" value={image.license} />
          )}

          {/* Source link */}
          {image.sourceUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Original</p>
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
              >
                View on {image.source}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-200">{value}</p>
    </div>
  )
}
