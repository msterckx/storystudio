import { NextRequest, NextResponse } from 'next/server'
import { rewriteContent, RewriteStyle } from '@/lib/ai/rewrite'
import { AIError } from '@/lib/ai'

const validStyles: RewriteStyle[] = ['simpler', 'academic', 'engaging', 'shorter']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { currentContent, style } = body

    if (!currentContent || typeof currentContent !== 'string') {
      return NextResponse.json(
        { error: 'currentContent is required' },
        { status: 400 }
      )
    }

    if (!style || !validStyles.includes(style)) {
      return NextResponse.json(
        { error: `style must be one of: ${validStyles.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await rewriteContent({
      currentContent,
      style,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Rewrite API error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === 'RATE_LIMITED' ? 429 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to rewrite content' },
      { status: 500 }
    )
  }
}
