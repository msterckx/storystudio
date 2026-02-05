import { callAI } from '../ai/call-ai'
import { ParsedCommand } from './actions'

const PARSE_SYSTEM_PROMPT = `You are a command parser for an educational story editor application. Parse the user's natural language command into a structured JSON action.

Available action types:
- remove_events: Delete one or more events. Requires eventIds array.
- add_event: Insert a new event. Optional afterEventId (ID of event to insert after) and topic (description of what the event should be about).
- reorder_event: Move an event to a new position. Requires eventId and newPosition (0-indexed).
- merge_events: Combine multiple events into one. Requires eventIds array (at least 2).
- expand_event: Add more detail to a single event. Requires eventId.
- expand_all: Expand all events with more detail. No additional fields needed.
- rewrite_event: Rewrite a single event in a different style. Requires eventId and style (e.g. "simpler", "academic", "engaging", "shorter").
- rewrite_all: Rewrite all events in a different style. Requires style.
- update_settings: Change project settings. Requires settings object with keys like "audience", "tone".

Important rules:
- When the user says "this event" or "the current event", use the selectedEventId.
- When the user references events by number (e.g. "event 3"), map to the event at that position (1-indexed) in the event list.
- When the user says "last event", use the last event in the list.
- If the command is ambiguous, set clarificationNeeded to true and provide clarificationOptions.
- Set confidence between 0 and 1 based on how certain you are about the interpretation.
- Always include a human-readable "description" of what the action will do.

Return ONLY valid JSON matching this schema:
{
  "action": { "type": "...", ... },
  "confidence": 0.0-1.0,
  "description": "Human-readable description of the action",
  "clarificationNeeded": false,
  "clarificationOptions": []
}`

interface ParseCommandInput {
  command: string
  events: Array<{ id: string; title: string; orderIndex: number }>
  selectedEventId?: string
}

export async function parseCommand(input: ParseCommandInput): Promise<ParsedCommand> {
  const eventList = input.events
    .map((e, i) => `${i + 1}. [id: ${e.id}] "${e.title}"`)
    .join('\n')

  const selectedInfo = input.selectedEventId
    ? `Currently selected event: ${input.events.find((e) => e.id === input.selectedEventId)?.title || 'Unknown'} (id: ${input.selectedEventId})`
    : 'No event currently selected'

  const userPrompt = `Event list:
${eventList}

${selectedInfo}

User command: "${input.command}"`

  const response = await callAI(PARSE_SYSTEM_PROMPT, userPrompt)

  // Extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse command response')
  }

  const parsed = JSON.parse(jsonMatch[0]) as ParsedCommand
  return parsed
}
