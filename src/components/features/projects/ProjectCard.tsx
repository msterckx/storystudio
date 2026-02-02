'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  title: string
  eventCount: number
  updatedAt: Date
  onDelete: (id: string) => void
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString()
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

export function ProjectCard({
  id,
  title,
  eventCount,
  updatedAt,
  onDelete,
}: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(id)
  }

  return (
    <Link href={`/projects/${id}`}>
      <Card hover className="p-4 group">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {eventCount} event{eventCount !== 1 ? 's' : ''} •{' '}
              {formatRelativeTime(updatedAt)}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
