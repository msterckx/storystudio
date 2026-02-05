'use client'

import { useState, useCallback, useRef } from 'react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 1.25

interface Position {
  x: number
  y: number
}

interface UseImageZoomReturn {
  zoom: number
  position: Position
  isDragging: boolean
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  handleWheel: (e: React.WheelEvent) => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  zoomPercentage: number
}

export function useImageZoom(initialZoom = 1): UseImageZoomReturn {
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const lastMousePos = useRef<Position>({ x: 0, y: 0 })

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * ZOOM_STEP, MAX_ZOOM))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / ZOOM_STEP, MIN_ZOOM))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z * ZOOM_STEP, MAX_ZOOM))
    } else {
      setZoom((z) => Math.max(z / ZOOM_STEP, MIN_ZOOM))
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsDragging(true)
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      setPosition((p) => ({ x: p.x + dx, y: p.y + dy }))
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    zoom,
    position,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomPercentage: Math.round(zoom * 100),
  }
}
