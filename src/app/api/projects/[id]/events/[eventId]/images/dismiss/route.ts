import { NextRequest, NextResponse } from 'next/server'
import { dismissImageForEvent } from '@/lib/db/images'

type RouteParams = { params: Promise<{ id: string; eventId: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const body = await request.json()

    const { id, thumbnailUrl, fullUrl, source, sourceUrl, license, title, creator, date } = body

    if (!id || !thumbnailUrl || !fullUrl || !source || !sourceUrl) {
      return NextResponse.json(
        { error: 'Missing required image fields' },
        { status: 400 }
      )
    }

    await dismissImageForEvent(eventId, {
      id,
      thumbnailUrl,
      fullUrl,
      source,
      sourceUrl,
      license: license || '',
      title,
      creator,
      date,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to dismiss image:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss image' },
      { status: 500 }
    )
  }
}
