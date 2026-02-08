'use client'

import { forwardRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EventStateIndicators } from './EventStateIndicators'

interface EventListItemProps {
  id: string
  orderIndex: number
  title: string
  source: 'ai' | 'user'
  locked: boolean
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

export const EventListItem = forwardRef<HTMLDivElement, EventListItemProps>(
  function EventListItem(
    { id, orderIndex, title, source, locked, isSelected, onSelect, onDelete },
    ref
  ) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete()
    }

    return (
      <div
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        style={style}
        className={`
          group relative flex items-center gap-2 p-3 rounded-lg border cursor-pointer
          transition-all duration-150
          ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
          ${
            isSelected
              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }
        `}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          className="flex-shrink-0 p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </button>

        {/* Order Number */}
        <span className="flex-shrink-0 w-5 text-xs text-gray-400 text-right">
          {orderIndex + 1}.
        </span>

        {/* Title */}
        <span className="flex-1 text-sm text-gray-900 truncate min-w-0">
          {title}
        </span>

        {/* State Indicators */}
        <EventStateIndicators
          source={source}
          locked={locked}
          className="flex-shrink-0"
        />

        {/* Delete Button */}
        <button
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
          title="Delete event"
          aria-label={`Delete ${title}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    )
  }
)
