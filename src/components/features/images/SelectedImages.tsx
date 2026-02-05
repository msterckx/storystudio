'use client'

import { useState } from 'react'
import { SearchImage } from '@/hooks/useImageSearch'

interface SelectedImagesProps {
  images: SearchImage[]
  onRemove: (imageId: string) => void
}

export function SelectedImages({ images, onRemove }: SelectedImagesProps) {
  if (images.length === 0) return null

  return (
    <div className="mb-4">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Selected ({images.length})
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image) => (
          <SelectedImageChip key={image.id} image={image} onRemove={() => onRemove(image.id)} />
        ))}
      </div>
    </div>
  )
}

function SelectedImageChip({
  image,
  onRemove,
}: {
  image: SearchImage
  onRemove: () => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-blue-300 group">
      {imgError ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <button
        onClick={onRemove}
        className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  )
}
