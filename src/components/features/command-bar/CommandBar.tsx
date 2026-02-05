'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCommandHistory } from '@/hooks/useCommandHistory'
import { ParsedCommand, CommandAction, describeAction } from '@/lib/commands/actions'

interface CommandEvent {
  id: string
  title: string
  orderIndex: number
}

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  events: CommandEvent[]
  selectedEventId: string | null
  onExecute: (action: CommandAction) => Promise<boolean>
}

type Status = 'idle' | 'parsing' | 'preview' | 'executing' | 'clarifying' | 'success' | 'error'

const SUGGESTIONS = [
  'Expand this event',
  'Add a new event',
  'Rewrite for high school audience',
  'Remove the last event',
]

export function CommandBar({
  isOpen,
  onClose,
  projectId,
  events,
  selectedEventId,
  onExecute,
}: CommandBarProps) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedClarification, setSelectedClarification] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { history, addCommand } = useCommandHistory(projectId)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setInput('')
      setStatus('idle')
      setParsedCommand(null)
      setErrorMessage('')
      setSelectedClarification(null)
      // Delay focus to ensure the modal is rendered
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (status === 'preview' || status === 'clarifying') {
          setStatus('idle')
          setParsedCommand(null)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, status, onClose])

  const eventTitleMap = new Map(events.map((e) => [e.id, e.title]))

  const submitCommand = useCallback(
    async (command: string) => {
      if (!command.trim()) return

      setInput(command)
      setStatus('parsing')
      setErrorMessage('')

      try {
        const response = await fetch('/api/ai/parse-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command,
            events: events.map((e) => ({
              id: e.id,
              title: e.title,
              orderIndex: e.orderIndex,
            })),
            selectedEventId,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to parse command')
        }

        const parsed: ParsedCommand = await response.json()

        if (parsed.clarificationNeeded) {
          setParsedCommand(parsed)
          setStatus('clarifying')
        } else {
          setParsedCommand(parsed)
          setStatus('preview')
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to parse command')
        setStatus('error')
      }
    },
    [events, selectedEventId]
  )

  const executeAction = useCallback(async () => {
    if (!parsedCommand) return

    setStatus('executing')

    try {
      const success = await onExecute(parsedCommand.action)
      if (success) {
        addCommand(input)
        setStatus('success')
        // Auto-close after success
        setTimeout(() => onClose(), 800)
      } else {
        setErrorMessage('Action failed to execute')
        setStatus('error')
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed')
      setStatus('error')
    }
  }, [parsedCommand, onExecute, input, addCommand, onClose])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (status === 'preview') {
        executeAction()
      } else if (status === 'idle' || status === 'error') {
        submitCommand(input)
      }
    },
    [status, input, submitCommand, executeAction]
  )

  const handleClarificationSelect = useCallback(
    (option: string) => {
      setSelectedClarification(option)
      // Re-submit with the clarification appended
      submitCommand(`${input} (${option})`)
    },
    [input, submitCommand]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Command bar */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center px-4 border-b border-gray-100">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (status !== 'idle') {
                  setStatus('idle')
                  setParsedCommand(null)
                }
              }}
              placeholder="Type a command..."
              className="flex-1 px-3 py-3.5 text-sm text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400"
              disabled={status === 'parsing' || status === 'executing'}
            />
            {status === 'parsing' && (
              <svg
                className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0"
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
            )}
          </div>
        </form>

        {/* Content area */}
        <div className="max-h-72 overflow-auto">
          {/* Success message */}
          {status === 'success' && (
            <div className="px-4 py-3 flex items-center gap-2 text-green-700 bg-green-50">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Done!</span>
            </div>
          )}

          {/* Error message */}
          {status === 'error' && (
            <div className="px-4 py-3 flex items-center gap-2 text-red-700 bg-red-50">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Action preview */}
          {status === 'preview' && parsedCommand && (
            <div className="p-4">
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Action
                </p>
                <p className="text-sm text-gray-900">
                  {parsedCommand.description ||
                    describeAction(parsedCommand.action, eventTitleMap)}
                </p>
                {parsedCommand.confidence < 0.8 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Low confidence — please verify this is what you intended
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={executeAction}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Execute
                </button>
                <button
                  onClick={() => {
                    setStatus('idle')
                    setParsedCommand(null)
                    inputRef.current?.focus()
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Executing state */}
          {status === 'executing' && (
            <div className="px-4 py-3 flex items-center gap-2 text-blue-700 bg-blue-50">
              <svg
                className="w-4 h-4 animate-spin"
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
              <span className="text-sm">Executing...</span>
            </div>
          )}

          {/* Clarification */}
          {status === 'clarifying' && parsedCommand?.clarificationOptions && (
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-2">
                {parsedCommand.description || 'Which did you mean?'}
              </p>
              <div className="space-y-1">
                {parsedCommand.clarificationOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleClarificationSelect(option)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 ${
                      selectedClarification === option
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Idle state: suggestions and history */}
          {status === 'idle' && !input && (
            <div>
              {/* Suggestions */}
              <div className="px-3 pt-2 pb-1">
                <p className="px-1 text-[10px] text-gray-400 uppercase tracking-wider">
                  Suggestions
                </p>
              </div>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submitCommand(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {suggestion}
                </button>
              ))}

              {/* History */}
              {history.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1">
                    <p className="px-1 text-[10px] text-gray-400 uppercase tracking-wider">
                      Recent
                    </p>
                  </div>
                  {history.map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => submitCommand(cmd)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-gray-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {cmd}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {status === 'preview' ? 'Enter to execute' : 'Enter to submit'}
          </span>
          <span className="text-[10px] text-gray-400">Esc to close</span>
        </div>
      </div>
    </div>
  )
}
