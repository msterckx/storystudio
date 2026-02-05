'use client'

import { SearchImage } from '@/hooks/useImageSearch'
import { ImageCard } from './ImageCard'

interface ImageGridProps {
  images: SearchImage[]
  selectedIds: Set<string>
  onSelect: (image: SearchImage) => void
  onDismiss: (image: SearchImage) => void
}

export function ImageGrid({ images, selectedIds, onSelect, onDismiss }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No images found</p>
        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selectedIds.has(image.id)}
          onSelect={() => onSelect(image)}
          onDismiss={() => onDismiss(image)}
        />
      ))}
    </div>
  )
}
