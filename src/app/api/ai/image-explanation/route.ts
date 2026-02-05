import { NextRequest, NextResponse } from 'next/server'
import { generateImageExplanation } from '@/lib/ai/image-explanation'
import { AIError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { imageMetadata, eventTitle, eventContent } = body

    if (!imageMetadata || !eventTitle) {
      return NextResponse.json(
        { error: 'imageMetadata and eventTitle are required' },
        { status: 400 }
      )
    }

    const result = await generateImageExplanation({
      imageMetadata,
      eventTitle,
      eventContent: eventContent || '',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Image explanation API error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
