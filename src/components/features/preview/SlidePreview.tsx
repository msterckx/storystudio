'use client'

import { useState } from 'react'
import { SlideTheme } from '@/lib/preview/themes'
import { selectLayout } from '@/lib/preview/layouts'

interface SlideImage {
  thumbnailUrl: string
  fullUrl: string
  title: string
  explanation: string
}

interface SlidePreviewProps {
  title: string
  content: string
  images: SlideImage[]
  theme: SlideTheme
  className?: string
}

// Strip HTML and truncate for slide display
function formatContent(html: string, maxLength: number = 300): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '...'
}

export function SlidePreview({ title, content, images, theme, className = '' }: SlidePreviewProps) {
  const plainContent = formatContent(content)
  const layout = selectLayout(content.length, images.length)

  return (
    <div
      className={`aspect-video rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="w-full h-full flex flex-col p-[6%]">
        {/* Title */}
        <h2
          className="font-bold mb-[3%] leading-tight"
          style={{
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            fontSize: 'clamp(0.5rem, 2.5vw, 1.5rem)',
          }}
        >
          {title || 'Untitled Event'}
        </h2>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {layout === 'text-only' && (
            <TextOnlyLayout content={plainContent} theme={theme} />
          )}
          {layout === 'text-single-image' && (
            <TextSingleImageLayout content={plainContent} image={images[0]} theme={theme} />
          )}
          {layout === 'text-multi-image' && (
            <TextMultiImageLayout content={plainContent} images={images} theme={theme} />
          )}
          {layout === 'image-focused' && (
            <ImageFocusedLayout content={plainContent} image={images[0]} theme={theme} />
          )}
        </div>
      </div>
    </div>
  )
}

function TextOnlyLayout({ content, theme }: { content: string; theme: SlideTheme }) {
  return (
    <p
      className="leading-relaxed"
      style={{
        color: theme.colors.text,
        fontSize: 'clamp(0.35rem, 1.2vw, 0.875rem)',
      }}
    >
      {content}
    </p>
  )
}

function TextSingleImageLayout({
  content,
  image,
  theme,
}: {
  content: string
  image: SlideImage
  theme: SlideTheme
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex gap-[4%] h-full">
      <div className="flex-1 min-w-0">
        <p
          className="leading-relaxed"
          style={{
            color: theme.colors.text,
            fontSize: 'clamp(0.3rem, 1.1vw, 0.8rem)',
          }}
        >
          {content}
        </p>
      </div>
      <div className="w-[40%] flex-shrink-0 flex flex-col">
        <div className="flex-1 rounded overflow-hidden bg-gray-200 min-h-0">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.thumbnailUrl}
              alt={image.title || ''}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        {image.explanation && (
          <p
            className="mt-1 rounded px-1 py-0.5 leading-tight"
            style={{
              color: theme.colors.captionText,
              backgroundColor: theme.colors.captionBg,
              fontSize: 'clamp(0.2rem, 0.7vw, 0.6rem)',
            }}
          >
            {image.explanation}
          </p>
        )}
      </div>
    </div>
  )
}

function TextMultiImageLayout({
  content,
  images,
  theme,
}: {
  content: string
  images: SlideImage[]
  theme: SlideTheme
}) {
  return (
    <div className="flex flex-col h-full gap-[3%]">
      <p
        className="leading-relaxed"
        style={{
          color: theme.colors.text,
          fontSize: 'clamp(0.3rem, 1vw, 0.75rem)',
        }}
      >
        {formatContent(content, 200)}
      </p>
      <div className="flex gap-[2%] min-h-0 flex-1">
        {images.slice(0, 3).map((image, i) => (
          <SlideImageThumb key={i} image={image} theme={theme} />
        ))}
      </div>
    </div>
  )
}

function ImageFocusedLayout({
  content,
  image,
  theme,
}: {
  content: string
  image: SlideImage
  theme: SlideTheme
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex flex-col h-full gap-[3%]">
      <div className="flex-1 rounded overflow-hidden bg-gray-200 min-h-0">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.fullUrl}
            alt={image.title || ''}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {content && (
        <p
          className="leading-tight"
          style={{
            color: theme.colors.text,
            fontSize: 'clamp(0.25rem, 0.9vw, 0.7rem)',
          }}
        >
          {formatContent(content, 150)}
        </p>
      )}
    </div>
  )
}

function SlideImageThumb({ image, theme }: { image: SlideImage; theme: SlideTheme }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 rounded overflow-hidden bg-gray-200 min-h-0">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.thumbnailUrl}
            alt={image.title || ''}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {image.explanation && (
        <p
          className="mt-0.5 leading-tight truncate"
          style={{
            color: theme.colors.captionText,
            fontSize: 'clamp(0.15rem, 0.6vw, 0.5rem)',
          }}
        >
          {image.explanation}
        </p>
      )}
    </div>
  )
}
