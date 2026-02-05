import { NextRequest, NextResponse } from 'next/server'
import {
  selectImageForEvent,
  deselectImageForEvent,
  getSelectedImages,
  updateEventImage,
} from '@/lib/db/images'

type RouteParams = { params: Promise<{ id: string; eventId: string }> }

// GET - Get selected images for an event
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const selectedImages = await getSelectedImages(eventId)
    return NextResponse.json({ images: selectedImages })
  } catch (error) {
    console.error('Failed to get event images:', error)
    return NextResponse.json(
      { error: 'Failed to get event images' },
      { status: 500 }
    )
  }
}

// POST - Select an image for an event
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

    await selectImageForEvent(eventId, {
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

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to select image:', error)
    return NextResponse.json(
      { error: 'Failed to select image' },
      { status: 500 }
    )
  }
}

// PATCH - Update image association (explanation, lock, order)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const body = await request.json()

    const { imageId, explanation, explanationLocked, orderIndex } = body

    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 }
      )
    }

    await updateEventImage(eventId, imageId, {
      explanation,
      explanationLocked,
      orderIndex,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update event image:', error)
    return NextResponse.json(
      { error: 'Failed to update event image' },
      { status: 500 }
    )
  }
}

// DELETE - Deselect an image for an event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId query parameter is required' },
        { status: 400 }
      )
    }

    await deselectImageForEvent(eventId, imageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to deselect image:', error)
    return NextResponse.json(
      { error: 'Failed to deselect image' },
      { status: 500 }
    )
  }
}
