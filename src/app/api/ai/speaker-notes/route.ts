import { NextRequest, NextResponse } from 'next/server'
import { generateSpeakerNotes } from '@/lib/ai/speaker-notes'
import { AIError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { events } = body

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'events array is required' },
        { status: 400 }
      )
    }

    const notes: string[] = []

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const nextEvent = events[i + 1]

      const result = await generateSpeakerNotes({
        eventTitle: event.title,
        eventContent: event.content || '',
        nextEventTitle: nextEvent?.title,
      })

      notes.push(result.notes)
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Speaker notes API error:', error)

    if (error instanceof AIError) {
      const status = error.code === 'API_KEY_MISSING' ? 503
        : error.code === 'RATE_LIMITED' ? 429
        : error.code === 'TIMEOUT' ? 504
        : 500

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate speaker notes' },
      { status: 500 }
    )
  }
}
