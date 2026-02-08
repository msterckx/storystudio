'use client'

import { useState, useCallback, useRef } from 'react'
import { ExportOptions, ExportSlideData, ExportSlideImage } from '@/types/export'
import { getThemeById } from '@/lib/preview/themes'
import { generatePPTX } from '@/lib/export/pptx'

export type ExportState = 'idle' | 'loading' | 'options' | 'generating' | 'complete' | 'error'

interface ExportProgress {
  current: number
  total: number
  message: string
}

interface UseExportParams {
  projectId: string
  projectTitle: string
  events: Array<{ id: string; title: string; content: string }>
  themeId: string
}

interface UseExportReturn {
  state: ExportState
  options: ExportOptions
  setOption: <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => void
  slideData: ExportSlideData[]
  progress: ExportProgress
  error: string | null
  slideCount: number
  filename: string
  open: () => void
  close: () => void
  startExport: () => Promise<void>
  downloadAgain: () => void
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50) || 'storystudio-export'
}

export function useExport({ projectId, projectTitle, events, themeId }: UseExportParams): UseExportReturn {
  const [state, setState] = useState<ExportState>('idle')
  const [options, setOptions] = useState<ExportOptions>({
    theme: themeId,
    includeSpeakerNotes: true,
    includeImageCaptions: true,
    includeCreditsSlide: true,
    includeTitleSlide: true,
    includeTableOfContents: false,
  })
  const [slideData, setSlideData] = useState<ExportSlideData[]>([])
  const [progress, setProgress] = useState<ExportProgress>({ current: 0, total: 0, message: '' })
  const [error, setError] = useState<string | null>(null)
  const [slideCount, setSlideCount] = useState(0)
  const blobRef = useRef<Blob | null>(null)

  const filename = `${sanitizeFilename(projectTitle)}.pptx`

  const triggerDownload = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filename])

  const setOption = useCallback(<K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }, [])

  const open = useCallback(async () => {
    setState('loading')
    setError(null)
    setOptions(prev => ({ ...prev, theme: themeId }))

    try {
      // Fetch selected images for all events in parallel
      const imagePromises = events.map(async (event) => {
        try {
          const response = await fetch(`/api/projects/${projectId}/events/${event.id}/images`)
          if (!response.ok) return []
          const data = await response.json()
          return (data.images || []).map((img: Record<string, unknown>): ExportSlideImage => ({
            fullUrl: img.fullUrl as string,
            thumbnailUrl: img.thumbnailUrl as string,
            title: (img.title as string) || '',
            creator: (img.creator as string) || '',
            source: (img.source as string) || '',
            sourceUrl: (img.sourceUrl as string) || '',
            license: (img.license as string) || '',
            explanation: (img.explanation as string) || '',
          }))
        } catch {
          return []
        }
      })

      const imagesByEvent = await Promise.all(imagePromises)

      const slides: ExportSlideData[] = events.map((event, i) => {
        const plainContent = event.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        return {
          eventId: event.id,
          title: event.title,
          content: event.content,
          plainContent,
          images: imagesByEvent[i] || [],
        }
      })

      setSlideData(slides)
      setState('options')
    } catch (err) {
      console.error('Failed to load export data:', err)
      setError('Failed to load project data for export.')
      setState('error')
    }
  }, [projectId, events, themeId])

  const startExport = useCallback(async () => {
    setState('generating')
    setError(null)

    try {
      let slides = [...slideData]

      // Generate speaker notes if requested
      if (options.includeSpeakerNotes) {
        setProgress({ current: 0, total: 1, message: 'Generating speaker notes...' })

        try {
          const response = await fetch('/api/ai/speaker-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              events: slides.map(s => ({
                title: s.title,
                content: s.content,
              })),
            }),
          })

          if (response.ok) {
            const data = await response.json()
            slides = slides.map((s, i) => ({
              ...s,
              speakerNotes: data.notes[i] || '',
            }))
          }
          // If speaker notes fail, continue without them
        } catch {
          console.warn('Speaker notes generation failed, continuing without them')
        }
      }

      // Generate PPTX
      const theme = getThemeById(options.theme)
      const blob = await generatePPTX(
        projectTitle,
        slides,
        options,
        theme,
        (current, total, message) => {
          setProgress({ current, total, message })
        }
      )

      blobRef.current = blob

      // Calculate slide count
      let count = slides.length
      if (options.includeTitleSlide) count++
      if (options.includeTableOfContents) count++
      if (options.includeCreditsSlide) count++
      setSlideCount(count)

      // Trigger download
      triggerDownload(blob)

      setState('complete')
    } catch (err) {
      console.error('Export failed:', err)
      setError(err instanceof Error ? err.message : 'Export failed. Please try again.')
      setState('error')
    }
  }, [slideData, options, projectTitle, triggerDownload])

  const downloadAgain = useCallback(() => {
    if (blobRef.current) {
      triggerDownload(blobRef.current)
    }
  }, [triggerDownload])

  const close = useCallback(() => {
    setState('idle')
    setSlideData([])
    setProgress({ current: 0, total: 0, message: '' })
    setError(null)
    blobRef.current = null
  }, [])

  return {
    state,
    options,
    setOption,
    slideData,
    progress,
    error,
    slideCount,
    filename,
    open,
    close,
    startExport,
    downloadAgain,
  }
}
