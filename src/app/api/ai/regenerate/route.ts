import { NextRequest, NextResponse } from 'next/server'
import { regenerateContent } from '@/lib/ai/regenerate'
import { AIError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { eventTitle, currentContent, instructions } = body

    if (!currentContent || typeof currentContent !== 'string') {
      return NextResponse.json(
        { error: 'currentContent is required' },
        { status: 400 }
      )
    }

    if (!eventTitle || typeof eventTitle !== 'string') {
      return NextResponse.json(
        { error: 'eventTitle is required' },
        { status: 400 }
      )
    }

    if (!instructions || typeof instructions !== 'string') {
      return NextResponse.json(
        { error: 'instructions is required' },
        { status: 400 }
      )
    }

    const result = await regenerateContent({
      eventTitle,
      currentContent,
      instructions,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Regenerate API error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    )
  }
}
