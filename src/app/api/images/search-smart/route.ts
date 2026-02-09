import { NextRequest, NextResponse } from 'next/server'
import { generateImageSearchQueries } from '@/lib/ai/image-search-terms'
import { searchWikimediaImages } from '@/lib/images/wikimedia'
import { analyzeImageRelevance } from '@/lib/ai/image-relevance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventTitle = searchParams.get('eventTitle')
    const eventContent = searchParams.get('eventContent') || ''

    if (!eventTitle) {
      return NextResponse.json(
        { error: 'eventTitle parameter is required' },
        { status: 400 }
      )
    }

    // Generate AI-powered search queries
    const queries = await generateImageSearchQueries(eventTitle, eventContent)

    // Run all queries in parallel, 6 results each
    const results = await Promise.all(
      queries.map((query) => searchWikimediaImages(query, 6))
    )

    // Deduplicate by image ID
    const seen = new Set<string>()
    const combined = results.flat().filter((image) => {
      if (seen.has(image.id)) return false
      seen.add(image.id)
      return true
    })

    // Analyze image relevance using vision AI
    const scored = await analyzeImageRelevance(combined, eventTitle, eventContent)

    return NextResponse.json({ images: scored })
  } catch (error) {
    console.error('Smart image search error:', error)
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    )
  }
}
