'use client'

import { Collapsible } from '@/components/ui/Collapsible'
import { Input } from '@/components/ui/Input'

export interface EventMetadata {
  date?: string
  tags?: string[]
  notes?: string
}

interface MetadataPanelProps {
  metadata: EventMetadata
  onChange: (metadata: EventMetadata) => void
  disabled?: boolean
}

export function MetadataPanel({ metadata, onChange, disabled }: MetadataPanelProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...metadata, date: e.target.value })
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    onChange({ ...metadata, tags })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...metadata, notes: e.target.value })
  }

  const tagsValue = metadata.tags?.join(', ') || ''

  return (
    <Collapsible title="Metadata" defaultOpen={false}>
      <div className="space-y-4">
        {/* Date Field */}
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <Input
            id="event-date"
            type="text"
            value={metadata.date || ''}
            onChange={handleDateChange}
            placeholder="e.g., 476 AD, March 15, 44 BC"
            disabled={disabled}
          />
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="event-tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Input
            id="event-tags"
            type="text"
            value={tagsValue}
            onChange={handleTagsChange}
            placeholder="Comma-separated tags"
            disabled={disabled}
          />
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {metadata.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="event-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="event-notes"
            value={metadata.notes || ''}
            onChange={handleNotesChange}
            placeholder="Private notes about this event..."
            disabled={disabled}
            rows={3}
            className={`
              w-full px-3 py-2 rounded-md border border-gray-300
              text-gray-900 placeholder-gray-400 text-sm
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              resize-none
            `}
          />
        </div>
      </div>
    </Collapsible>
  )
}
