'use client'

import { useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ExportOptions } from './ExportOptions'
import { ExportProgress } from './ExportProgress'
import { ExportComplete } from './ExportComplete'
import { SlidePreview } from '@/components/features/preview/SlidePreview'
import { getThemeById } from '@/lib/preview/themes'
import { useExport, ExportState } from '@/hooks/useExport'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  events: Array<{ id: string; title: string; content: string }>
  themeId: string
}

export function ExportModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  events,
  themeId,
}: ExportModalProps) {
  const {
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
  } = useExport({ projectId, projectTitle, events, themeId })

  // Open export flow when modal opens
  useEffect(() => {
    if (isOpen && state === 'idle') {
      open()
    }
  }, [isOpen, state, open])

  const handleClose = () => {
    close()
    onClose()
  }

  const handleRetry = () => {
    startExport()
  }

  const isInterruptible = state === 'options' || state === 'complete' || state === 'error' || state === 'loading'

  const renderContent = () => {
    if (state === 'loading') {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
            <svg
              className="animate-spin w-8 h-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading project data...</p>
        </div>
      )
    }

    if (state === 'generating') {
      return (
        <ExportProgress
          current={progress.current}
          total={progress.total}
          message={progress.message}
        />
      )
    }

    if (state === 'complete') {
      return (
        <ExportComplete
          filename={filename}
          slideCount={slideCount}
          onDownloadAgain={downloadAgain}
          onClose={handleClose}
        />
      )
    }

    if (state === 'error') {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Export Failed</p>
          <p className="text-sm text-gray-500 mb-6">
            {error || 'Something went wrong. Please try again.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      )
    }

    // Options state
    const theme = getThemeById(options.theme)

    return (
      <div className="space-y-5">
        <div className="flex gap-6">
          {/* Left column: options */}
          <div className="w-64 flex-shrink-0">
            <ExportOptions options={options} onOptionChange={setOption} />
          </div>

          {/* Right column: preview thumbnails */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview ({slideData.length} {slideData.length === 1 ? 'slide' : 'slides'})
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {slideData.map((slide) => (
                <SlidePreview
                  key={slide.eventId}
                  title={slide.title}
                  content={slide.content}
                  images={slide.images.map((img) => ({
                    thumbnailUrl: img.thumbnailUrl,
                    fullUrl: img.fullUrl,
                    title: img.title,
                    explanation: img.explanation,
                  }))}
                  theme={theme}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={startExport} disabled={slideData.length === 0}>
            Export as PowerPoint
          </Button>
        </div>
      </div>
    )
  }

  const getTitle = (s: ExportState) => {
    switch (s) {
      case 'options': return 'Export Presentation'
      case 'loading': return 'Export Presentation'
      default: return undefined
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isInterruptible ? handleClose : () => {}}
      title={getTitle(state)}
      size="lg"
    >
      {renderContent()}
    </Modal>
  )
}
