import { ExportSlideData, CreditEntry } from '@/types/export'

export function collectCredits(slides: ExportSlideData[]): CreditEntry[] {
  const credits: CreditEntry[] = []

  slides.forEach((slide, index) => {
    slide.images.forEach((img) => {
      credits.push({
        slideNumber: index + 1,
        imageTitle: img.title || 'Untitled',
        source: img.source,
        sourceUrl: img.sourceUrl,
        license: img.license,
        creator: img.creator || 'Unknown',
      })
    })
  })

  return credits
}
