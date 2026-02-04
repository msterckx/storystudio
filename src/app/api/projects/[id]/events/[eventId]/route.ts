import { NextRequest, NextResponse } from 'next/server'
import { getEvent, updateEvent, deleteEvent } from '@/lib/db/events'

type RouteParams = { params: Promise<{ id: string; eventId: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const event = await getEvent(eventId)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const body = await request.json()

    const event = await updateEvent(eventId, {
      title: body.title,
      content: body.content,
      locked: body.locked,
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    await deleteEvent(eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
