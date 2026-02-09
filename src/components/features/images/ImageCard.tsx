'use client'

import { useState } from 'react'
import { SearchImage } from '@/hooks/useImageSearch'

interface ImageCardProps {
  image: SearchImage
  isSelected: boolean
  onSelect: () => void
  onDismiss: () => void
  onInspect?: () => void
}

export function ImageCard({ image, isSelected, onSelect, onDismiss, onInspect }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className="aspect-square bg-gray-100 cursor-pointer"
        onClick={onInspect}
      >
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.thumbnailUrl}
            alt={image.title || 'Image'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Source badge and relevance indicator */}
      <div className="absolute top-1 left-1 flex items-center gap-1">
        <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded">
          {image.source}
        </span>
        {image.relevanceScore != null && (
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              image.relevanceScore >= 70 ? 'bg-green-400' : 'bg-yellow-400'
            }`}
            title={`Relevance: ${image.relevanceScore}${image.relevanceReason ? ` — ${image.relevanceReason}` : ''}`}
          />
        )}
      </div>

      {/* Hover overlay with actions */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 cursor-pointer" onClick={onInspect}>
          {/* Title, description, and relevance reason */}
          {image.title && (
            <p className="text-xs text-white font-medium line-clamp-2">{image.title}</p>
          )}
          {image.relevanceReason ? (
            <p className="text-[10px] text-gray-200 italic line-clamp-2 mt-0.5">{image.relevanceReason}</p>
          ) : image.description ? (
            <p className="text-[10px] text-gray-200 line-clamp-2 mt-0.5">{image.description}</p>
          ) : null}

          {/* Actions */}
          <div className="flex gap-1">
            {!isSelected && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect() }}
                className="flex-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="flex-1 px-2 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Dismiss
            </button>
          </div>

          {/* Metadata on hover */}
          {(image.license || image.date) && (
            <div className="mt-1 text-[10px] text-gray-300">
              {image.license && <span>{image.license}</span>}
              {image.license && image.date && <span> · </span>}
              {image.date && <span>{image.date}</span>}
            </div>
          )}
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
