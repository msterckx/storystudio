'use client'

import { ReactNode, useState, useCallback, useRef, useEffect } from 'react'

interface ThreePaneLayoutProps {
  leftPane: ReactNode
  middlePane: ReactNode
  rightPane: ReactNode
  leftPaneMinWidth?: number
  rightPaneMinWidth?: number
  leftPaneDefaultWidth?: number
  rightPaneDefaultWidth?: number
}

export function ThreePaneLayout({
  leftPane,
  middlePane,
  rightPane,
  leftPaneMinWidth = 200,
  rightPaneMinWidth = 300,
  leftPaneDefaultWidth = 250,
  rightPaneDefaultWidth = 350,
}: ThreePaneLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(leftPaneDefaultWidth)
  const [rightWidth, setRightWidth] = useState(rightPaneDefaultWidth)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      if (isDraggingLeft) {
        const newWidth = e.clientX - containerRect.left
        setLeftWidth(Math.max(leftPaneMinWidth, Math.min(newWidth, 400)))
      }

      if (isDraggingRight) {
        const newWidth = containerRect.right - e.clientX
        setRightWidth(Math.max(rightPaneMinWidth, Math.min(newWidth, 500)))
      }
    },
    [isDraggingLeft, isDraggingRight, leftPaneMinWidth, rightPaneMinWidth]
  )

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }, [])

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDraggingLeft, isDraggingRight, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Left Pane */}
      <div
        className="flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-hidden"
        style={{ width: leftWidth }}
      >
        {leftPane}
      </div>

      {/* Left Resize Handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors flex-shrink-0"
        onMouseDown={() => setIsDraggingLeft(true)}
      />

      {/* Middle Pane */}
      <div className="flex-1 min-w-[400px] overflow-hidden bg-white">{middlePane}</div>

      {/* Right Resize Handle */}
      <div
        className="w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors flex-shrink-0"
        onMouseDown={() => setIsDraggingRight(true)}
      />

      {/* Right Pane */}
      <div
        className="flex-shrink-0 border-l border-gray-200 bg-gray-50 overflow-hidden"
        style={{ width: rightWidth }}
      >
        {rightPane}
      </div>
    </div>
  )
}
