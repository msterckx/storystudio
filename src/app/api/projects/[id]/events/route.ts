import { NextRequest, NextResponse } from 'next/server'
import { getEvents, createEvent, reorderEvents } from '@/lib/db/events'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params
    const events = await getEvents(projectId)
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    const event = await createEvent(projectId, {
      title: body.title,
      content: body.content,
      afterEventId: body.afterEventId,
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    if (body.eventIds) {
      // Reorder operation
      await reorderEvents(projectId, body.eventIds)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update events:', error)
    return NextResponse.json(
      { error: 'Failed to update events' },
      { status: 500 }
    )
  }
}
