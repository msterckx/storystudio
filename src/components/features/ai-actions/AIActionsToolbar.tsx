'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { AIPreviewModal } from './AIPreviewModal'
import { SplitPreviewModal } from './SplitPreviewModal'
import { RegenerateModal } from './RegenerateModal'
import { RewriteStyle } from '@/lib/ai/rewrite'

interface SplitEvent {
  title: string
  content: string
}

interface AIActionsToolbarProps {
  eventId: string
  eventTitle: string
  eventContent: string
  isLocked: boolean
  projectContext?: string
  onContentChange: (content: string) => void
  onSplitApply: (events: SplitEvent[]) => void
}

type ActionType = 'expand' | 'rewrite' | 'split' | 'regenerate' | null
type ModalState = 'idle' | 'input' | 'loading' | 'preview' | 'error'

// Word count helper
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function AIActionsToolbar({
  eventTitle,
  eventContent,
  isLocked,
  projectContext,
  onContentChange,
  onSplitApply,
}: AIActionsToolbarProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Result states
  const [previewContent, setPreviewContent] = useState<string>('')
  const [splitEvents, setSplitEvents] = useState<SplitEvent[]>([])
  const [rewriteStyle, setRewriteStyle] = useState<RewriteStyle | null>(null)

  // Dropdown state
  const [showRewriteDropdown, setShowRewriteDropdown] = useState(false)

  const isActionInProgress = modalState === 'loading'
  const canSplit = getWordCount(eventContent) > 200

  // Reset state
  const resetState = useCallback(() => {
    setActiveAction(null)
    setModalState('idle')
    setError(null)
    setPreviewContent('')
    setSplitEvents([])
    setRewriteStyle(null)
    setShowRewriteDropdown(false)
  }, [])

  // Handle expand
  const handleExpand = useCallback(async () => {
    setActiveAction('expand')
    setModalState('loading')
    setError(null)

    try {
      const response = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle,
          currentContent: eventContent,
          projectContext,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to expand content')
      }

      const data = await response.json()
      setPreviewContent(data.expandedContent)
      setModalState('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setModalState('error')
    }
  }, [eventTitle, eventContent, projectContext])

  // Handle rewrite
  const handleRewrite = useCallback(
    async (style: RewriteStyle) => {
      setShowRewriteDropdown(false)
      setActiveAction('rewrite')
      setRewriteStyle(style)
      setModalState('loading')
      setError(null)

      try {
        const response = await fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentContent: eventContent,
            style,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to rewrite content')
        }

        const data = await response.json()
        setPreviewContent(data.rewrittenContent)
        setModalState('preview')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setModalState('error')
      }
    },
    [eventContent]
  )

  // Handle split
  const handleSplit = useCallback(async () => {
    setActiveAction('split')
    setModalState('loading')
    setError(null)

    try {
      const response = await fetch('/api/ai/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle,
          currentContent: eventContent,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to split content')
      }

      const data = await response.json()
      setSplitEvents(data.events)
      setModalState('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setModalState('error')
    }
  }, [eventTitle, eventContent])

  // Handle regenerate
  const handleRegenerateStart = useCallback(() => {
    setActiveAction('regenerate')
    setModalState('input')
  }, [])

  const handleRegenerateSubmit = useCallback(
    async (instructions: string) => {
      setModalState('loading')
      setError(null)

      try {
        const response = await fetch('/api/ai/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventTitle,
            currentContent: eventContent,
            instructions,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to regenerate content')
        }

        const data = await response.json()
        setPreviewContent(data.regeneratedContent)
        setModalState('preview')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setModalState('error')
      }
    },
    [eventTitle, eventContent]
  )

  // Apply handlers
  const handleApplyContent = useCallback(() => {
    onContentChange(previewContent)
    resetState()
  }, [previewContent, onContentChange, resetState])

  const handleApplySplit = useCallback(() => {
    onSplitApply(splitEvents)
    resetState()
  }, [splitEvents, onSplitApply, resetState])

  // Get rewrite style label
  const getRewriteStyleLabel = (style: RewriteStyle): string => {
    const labels: Record<RewriteStyle, string> = {
      simpler: 'Make Simpler',
      academic: 'Make Academic',
      engaging: 'Make Engaging',
      shorter: 'Shorten',
    }
    return labels[style]
  }

  return (
    <>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-2">
          {/* Expand */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExpand}
            disabled={isLocked || isActionInProgress}
          >
            {activeAction === 'expand' && isActionInProgress ? (
              <Spinner />
            ) : (
              'Expand'
            )}
          </Button>

          {/* Rewrite dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRewriteDropdown(!showRewriteDropdown)}
              disabled={isLocked || isActionInProgress}
            >
              {activeAction === 'rewrite' && isActionInProgress ? (
                <Spinner />
              ) : (
                <>
                  Rewrite
                  <svg
                    className="ml-1 w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </Button>
            {showRewriteDropdown && (
              <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px] z-10">
                {(['simpler', 'academic', 'engaging', 'shorter'] as RewriteStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => handleRewrite(style)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {getRewriteStyleLabel(style)}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Split */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSplit}
            disabled={isLocked || isActionInProgress || !canSplit}
            title={!canSplit ? 'Content must be over 200 words to split' : undefined}
          >
            {activeAction === 'split' && isActionInProgress ? (
              <Spinner />
            ) : (
              'Split'
            )}
          </Button>

          {/* Regenerate */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerateStart}
            disabled={isLocked || isActionInProgress}
          >
            {activeAction === 'regenerate' && isActionInProgress ? (
              <Spinner />
            ) : (
              'Regenerate'
            )}
          </Button>
        </div>

        {/* Error message */}
        {modalState === 'error' && error && (
          <div className="mt-2 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={resetState}
              className="text-sm text-gray-500 hover:text-gray-700 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Preview modals */}
      {activeAction !== 'split' && modalState === 'preview' && (
        <AIPreviewModal
          isOpen={true}
          title={
            activeAction === 'expand'
              ? 'Expand Preview'
              : activeAction === 'rewrite' && rewriteStyle
                ? `Rewrite Preview: ${getRewriteStyleLabel(rewriteStyle)}`
                : 'Regenerate Preview'
          }
          originalContent={eventContent}
          newContent={previewContent}
          onApply={handleApplyContent}
          onCancel={resetState}
        />
      )}

      {activeAction === 'split' && modalState === 'preview' && (
        <SplitPreviewModal
          isOpen={true}
          originalTitle={eventTitle}
          originalContent={eventContent}
          proposedEvents={splitEvents}
          onApply={handleApplySplit}
          onCancel={resetState}
        />
      )}

      {/* Regenerate instructions modal */}
      {activeAction === 'regenerate' && modalState === 'input' && (
        <RegenerateModal
          isOpen={true}
          onSubmit={handleRegenerateSubmit}
          onCancel={resetState}
        />
      )}
    </>
  )
}
