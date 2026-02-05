import { NextRequest, NextResponse } from 'next/server'
import { searchWikimediaImages } from '@/lib/images/wikimedia'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '12', 10)

    if (!query) {
      return NextResponse.json(
        { error: 'query parameter is required' },
        { status: 400 }
      )
    }

    const images = await searchWikimediaImages(query, limit)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Image search error:', error)
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    )
  }
}
