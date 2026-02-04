'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PromptInput } from './PromptInput'
import { SettingsSelector } from './SettingsSelector'
import { GenerationProgress } from './GenerationProgress'
import { AudienceLevel, Tone, TargetLength } from '@/lib/ai/prompts'

interface GenerateStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onStartBlank: () => void
}

type ModalState = 'input' | 'generating' | 'error'

interface ErrorState {
  message: string
  code?: string
}

export function GenerateStoryModal({
  isOpen,
  onClose,
  onStartBlank,
}: GenerateStoryModalProps) {
  const router = useRouter()
  const [state, setState] = useState<ModalState>('input')
  const [error, setError] = useState<ErrorState | null>(null)

  // Form state
  const [prompt, setPrompt] = useState('')
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel>('general')
  const [tone, setTone] = useState<Tone>('storytelling')
  const [targetLength, setTargetLength] = useState<TargetLength>('standard')

  // Abort controller for cancellation
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setState('generating')
    setError(null)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          settings: {
            audienceLevel,
            tone,
            targetLength,
          },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate story')
      }

      const data = await response.json()

      // Navigate to the new project
      router.push(`/projects/${data.project.id}`)
      onClose()
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled
        setState('input')
        return
      }

      setState('error')
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      })
    } finally {
      setAbortController(null)
    }
  }

  const handleCancel = () => {
    if (abortController) {
      abortController.abort()
    }
    setState('input')
  }

  const handleRetry = () => {
    setState('input')
    setError(null)
  }

  const handleClose = () => {
    if (state === 'generating') {
      handleCancel()
    }
    setState('input')
    setError(null)
    setPrompt('')
    onClose()
  }

  const renderContent = () => {
    if (state === 'generating') {
      return <GenerationProgress onCancel={handleCancel} />
    }

    if (state === 'error') {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Generation Failed
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      )
    }

    // Input state
    return (
      <div className="space-y-6">
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          disabled={false}
        />

        <SettingsSelector
          audienceLevel={audienceLevel}
          tone={tone}
          targetLength={targetLength}
          onAudienceLevelChange={setAudienceLevel}
          onToneChange={setTone}
          onTargetLengthChange={setTargetLength}
          disabled={false}
        />

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onStartBlank}>
            Start Blank
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!prompt.trim()}>
              Generate Story
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={state === 'generating' ? () => {} : handleClose}
      title={state === 'generating' ? undefined : 'Create New Story'}
    >
      {renderContent()}
    </Modal>
  )
}
