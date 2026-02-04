'use client'

import { useState, ReactNode } from 'react'

interface CollapsibleProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
