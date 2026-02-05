// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'it', 'its', 'this', 'that', 'these', 'those', 'he', 'she', 'they',
  'we', 'you', 'i', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
  'his', 'our', 'their', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'not', 'no', 'nor', 'as', 'if', 'then', 'than', 'too',
  'very', 'just', 'about', 'above', 'after', 'again', 'all', 'also',
  'any', 'because', 'before', 'between', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'into', 'through', 'during', 'until',
  'while', 'so', 'new', 'event', 'events', 'many', 'much', 'well',
  'over', 'only', 'also', 'even', 'still', 'however', 'one', 'two',
  'first', 'second', 'last', 'made', 'make', 'like', 'time', 'year',
])

function getFirstParagraph(content: string): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  // Get first ~200 characters
  const firstChunk = text.slice(0, 200)
  // Try to end at a sentence boundary
  const sentenceEnd = firstChunk.lastIndexOf('.')
  if (sentenceEnd > 50) {
    return firstChunk.slice(0, sentenceEnd + 1)
  }
  return firstChunk
}

export function extractSearchTerms(title: string, content: string): string {
  const text = `${title} ${getFirstParagraph(content)}`

  // Tokenize and filter
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

  // Count word frequency, prefer title words
  const titleWords = new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  )

  const freq = new Map<string, number>()
  for (const word of words) {
    const score = (freq.get(word) || 0) + (titleWords.has(word) ? 3 : 1)
    freq.set(word, score)
  }

  // Sort by frequency and take top keywords
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  return keywords.join(' ')
}
