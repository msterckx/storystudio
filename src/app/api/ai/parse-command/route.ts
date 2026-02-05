import { NextRequest, NextResponse } from 'next/server'
import { parseCommand } from '@/lib/commands/parse-command'
import { AIError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { command, events, selectedEventId } = body

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      )
    }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events list is required' },
        { status: 400 }
      )
    }

    const result = await parseCommand({
      command,
      events,
      selectedEventId,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'RATE_LIMITED' ? 429 : 500 }
      )
    }
    console.error('Failed to parse command:', error)
    return NextResponse.json(
      { error: 'Failed to parse command' },
      { status: 500 }
    )
  }
}
