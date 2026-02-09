'use server'

import { callAIVision } from './call-ai-vision'

interface ImageForAnalysis {
  id: string
  thumbnailUrl: string
  title: string
}

interface RelevanceResult {
  index: number
  score: number
  reason: string
}

const SYSTEM_PROMPT = `You are an image relevance analyst for an educational presentation tool. You visually inspect images and score how relevant each one is to a given historical or educational event.

For each image, assign a relevance score from 0-100:
- 90-100: Perfect match — directly depicts the event, person, or place
- 70-89: Strong match — closely related subject, correct era/context
- 40-69: Moderate — tangentially related, same general topic
- 20-39: Weak — loosely connected, different era or context
- 0-19: Irrelevant — wrong subject, decorative, or unrelated

Respond ONLY with a JSON array. No other text. Example:
[{"index":1,"score":85,"reason":"Shows the Roman Senate chamber where key political debates took place"},{"index":2,"score":15,"reason":"Modern photograph unrelated to the historical period"}]`

export async function analyzeImageRelevance<T extends ImageForAnalysis>(
  images: T[],
  eventTitle: string,
  eventContent: string
): Promise<(T & { relevanceScore?: number; relevanceReason?: string })[]> {
  if (images.length === 0) return images

  try {
    const truncatedContent = eventContent.slice(0, 500)

    const contentBlocks: ({ type: 'text'; text: string } | { type: 'image'; url: string })[] = []

    // Lead with the event context
    let textPart = `Event: "${eventTitle}"\nContext: ${truncatedContent}\n\nAnalyze the following ${images.length} images for relevance to this event:\n`
    images.forEach((img, i) => {
      textPart += `\nImage ${i + 1}: "${img.title}"`
    })
    contentBlocks.push({ type: 'text', text: textPart })

    // Add each thumbnail as an image block
    for (const img of images) {
      contentBlocks.push({ type: 'image', url: img.thumbnailUrl })
    }

    contentBlocks.push({
      type: 'text',
      text: `\nScore all ${images.length} images. Return a JSON array with index (1-based), score (0-100), and reason (1 concise sentence explaining why the image is or isn't a good match) for each.`,
    })

    console.log(`[image-relevance] Analyzing ${images.length} images for "${eventTitle}"`)

    const response = await callAIVision(SYSTEM_PROMPT, contentBlocks)

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn('[image-relevance] Could not parse response, returning unsorted')
      return images
    }

    const results: RelevanceResult[] = JSON.parse(jsonMatch[0])

    // Map scores onto images
    const scored = images.map((img, i) => {
      const result = results.find((r) => r.index === i + 1)
      return {
        ...img,
        relevanceScore: result?.score,
        relevanceReason: result?.reason,
      }
    })

    // Sort by score descending, filter out < 20
    const filtered = scored
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .filter((img) => (img.relevanceScore ?? 100) >= 20)

    console.log(`[image-relevance] Kept ${filtered.length}/${images.length} images after filtering`)

    return filtered
  } catch (error) {
    console.error('[image-relevance] Analysis failed, returning original images:', error)
    return images
  }
}
