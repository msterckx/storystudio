export type CommandAction =
  | { type: 'remove_events'; eventIds: string[] }
  | { type: 'add_event'; afterEventId?: string; topic?: string }
  | { type: 'reorder_event'; eventId: string; newPosition: number }
  | { type: 'merge_events'; eventIds: string[] }
  | { type: 'expand_event'; eventId: string }
  | { type: 'expand_all' }
  | { type: 'rewrite_event'; eventId: string; style: string }
  | { type: 'rewrite_all'; style: string }
  | { type: 'update_settings'; settings: Record<string, unknown> }

export interface ParsedCommand {
  action: CommandAction
  confidence: number
  description: string
  clarificationNeeded?: boolean
  clarificationOptions?: string[]
}

export function describeAction(action: CommandAction, eventTitles: Map<string, string>): string {
  switch (action.type) {
    case 'remove_events': {
      const names = action.eventIds
        .map((id) => eventTitles.get(id) || 'Unknown')
        .join(', ')
      return `Remove ${action.eventIds.length === 1 ? 'event' : 'events'}: ${names}`
    }
    case 'add_event':
      return action.topic
        ? `Add new event about "${action.topic}"${action.afterEventId ? ` after "${eventTitles.get(action.afterEventId) || 'Unknown'}"` : ''}`
        : `Add new blank event${action.afterEventId ? ` after "${eventTitles.get(action.afterEventId) || 'Unknown'}"` : ''}`
    case 'reorder_event':
      return `Move "${eventTitles.get(action.eventId) || 'Unknown'}" to position ${action.newPosition + 1}`
    case 'merge_events': {
      const names = action.eventIds
        .map((id) => eventTitles.get(id) || 'Unknown')
        .join(', ')
      return `Merge events: ${names}`
    }
    case 'expand_event':
      return `Expand "${eventTitles.get(action.eventId) || 'Unknown'}" with more detail`
    case 'expand_all':
      return 'Expand all events with more detail'
    case 'rewrite_event':
      return `Rewrite "${eventTitles.get(action.eventId) || 'Unknown'}" in ${action.style} style`
    case 'rewrite_all':
      return `Rewrite all events in ${action.style} style`
    case 'update_settings':
      return `Update project settings`
    default:
      return 'Unknown action'
  }
}
