import { NextRequest, NextResponse } from 'next/server'
import { expandContent } from '@/lib/ai/expand'
import { AIError } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { eventTitle, currentContent, projectContext } = body

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

    const result = await expandContent({
      eventTitle,
      currentContent,
      projectContext,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Expand API error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to expand content' },
      { status: 500 }
    )
  }
}
