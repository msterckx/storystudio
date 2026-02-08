export interface ExportOptions {
  theme: string
  includeSpeakerNotes: boolean
  includeImageCaptions: boolean
  includeCreditsSlide: boolean
  includeTitleSlide: boolean
  includeTableOfContents: boolean
}

export interface ExportSlideData {
  eventId: string
  title: string
  content: string
  plainContent: string
  images: ExportSlideImage[]
  speakerNotes?: string
}

export interface ExportSlideImage {
  fullUrl: string
  thumbnailUrl: string
  title: string
  creator: string
  source: string
  sourceUrl: string
  license: string
  explanation: string
}

export interface CreditEntry {
  slideNumber: number
  imageTitle: string
  source: string
  sourceUrl: string
  license: string
  creator: string
}
