'use client'

import { useState, useEffect } from 'react'

interface SlidePreviewData {
  title: string
  content: string
}

export function useSlidePreview(title: string, content: string): SlidePreviewData {
  const [previewData, setPreviewData] = useState({ title, content })

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewData({ title, content })
    }, 300)

    return () => clearTimeout(timer)
  }, [title, content])

  return previewData
}
