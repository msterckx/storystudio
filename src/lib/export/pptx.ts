import pptxgen from 'pptxgenjs'
import { ExportOptions, ExportSlideData } from '@/types/export'
import { SlideTheme } from '@/lib/preview/themes'
import { selectLayout } from '@/lib/preview/layouts'
import { collectCredits } from './credits'

const SLIDE_WIDTH = 10 // inches (standard 16:9)
const SLIDE_HEIGHT = 5.625
const MARGIN = 0.6

function toHex(color: string): string {
  return color.replace('#', '').replace(/^rgba?\(.+\)$/, 'CCCCCC')
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '...'
}

function addTitleSlide(
  pptx: pptxgen,
  projectTitle: string,
  theme: SlideTheme
): void {
  const slide = pptx.addSlide()
  slide.background = { color: toHex(theme.colors.background) }

  slide.addText(projectTitle, {
    x: MARGIN,
    y: SLIDE_HEIGHT * 0.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 1.2,
    fontSize: 36,
    fontFace: theme.fonts.title,
    color: toHex(theme.colors.title),
    align: 'center',
    bold: true,
  })

  slide.addText('Created with StoryStudio', {
    x: MARGIN,
    y: SLIDE_HEIGHT * 0.3 + 1.4,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.5,
    fontSize: 14,
    fontFace: theme.fonts.body,
    color: toHex(theme.colors.text),
    align: 'center',
  })
}

function addTOCSlide(
  pptx: pptxgen,
  slides: ExportSlideData[],
  theme: SlideTheme
): void {
  const slide = pptx.addSlide()
  slide.background = { color: toHex(theme.colors.background) }

  slide.addText('Table of Contents', {
    x: MARGIN,
    y: 0.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.8,
    fontSize: 28,
    fontFace: theme.fonts.title,
    color: toHex(theme.colors.title),
    bold: true,
  })

  const tocItems = slides.map((s, i) => ({
    text: `${i + 1}. ${s.title || 'Untitled'}`,
    options: {
      fontSize: 14,
      fontFace: theme.fonts.body,
      color: toHex(theme.colors.text),
      bullet: false,
      breakLine: true as const,
      paraSpaceAfter: 6,
    },
  }))

  slide.addText(tocItems, {
    x: MARGIN,
    y: 1.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: SLIDE_HEIGHT - 1.6,
    valign: 'top',
  })
}

async function addContentSlide(
  pptx: pptxgen,
  slideData: ExportSlideData,
  options: ExportOptions,
  theme: SlideTheme
): Promise<void> {
  const slide = pptx.addSlide()
  slide.background = { color: toHex(theme.colors.background) }

  const titleHeight = 0.7
  const titleY = 0.3

  // Title
  slide.addText(slideData.title || 'Untitled', {
    x: MARGIN,
    y: titleY,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: titleHeight,
    fontSize: 24,
    fontFace: theme.fonts.title,
    color: toHex(theme.colors.title),
    bold: true,
    valign: 'top',
  })

  const contentY = titleY + titleHeight + 0.15
  const contentH = SLIDE_HEIGHT - contentY - 0.3
  const contentW = SLIDE_WIDTH - MARGIN * 2
  const plainContent = truncate(slideData.plainContent, 500)
  const layout = selectLayout(slideData.content.length, slideData.images.length)

  if (layout === 'text-only') {
    slide.addText(plainContent, {
      x: MARGIN,
      y: contentY,
      w: contentW,
      h: contentH,
      fontSize: 14,
      fontFace: theme.fonts.body,
      color: toHex(theme.colors.text),
      valign: 'top',
      wrap: true,
    })
  } else if (layout === 'text-single-image' && slideData.images[0]) {
    const image = slideData.images[0]
    const textW = contentW * 0.55
    const imgW = contentW * 0.4
    const imgX = MARGIN + textW + contentW * 0.05

    slide.addText(plainContent, {
      x: MARGIN,
      y: contentY,
      w: textW,
      h: contentH,
      fontSize: 13,
      fontFace: theme.fonts.body,
      color: toHex(theme.colors.text),
      valign: 'top',
      wrap: true,
    })

    try {
      const imgH = options.includeImageCaptions && image.explanation
        ? contentH - 0.5
        : contentH

      slide.addImage({
        path: image.fullUrl,
        x: imgX,
        y: contentY,
        w: imgW,
        h: imgH,
        sizing: { type: 'contain', w: imgW, h: imgH },
      })

      if (options.includeImageCaptions && image.explanation) {
        slide.addText(truncate(image.explanation, 120), {
          x: imgX,
          y: contentY + imgH + 0.05,
          w: imgW,
          h: 0.4,
          fontSize: 9,
          fontFace: theme.fonts.body,
          color: toHex(theme.colors.captionText),
          valign: 'top',
          wrap: true,
        })
      }
    } catch {
      // Image failed to load — slide renders without it
    }
  } else if (layout === 'text-multi-image') {
    const textH = contentH * 0.35
    const imgY = contentY + textH + 0.1
    const imgH = contentH - textH - 0.1

    slide.addText(truncate(plainContent, 300), {
      x: MARGIN,
      y: contentY,
      w: contentW,
      h: textH,
      fontSize: 13,
      fontFace: theme.fonts.body,
      color: toHex(theme.colors.text),
      valign: 'top',
      wrap: true,
    })

    const visibleImages = slideData.images.slice(0, 3)
    const imgW = (contentW - 0.2 * (visibleImages.length - 1)) / visibleImages.length

    for (let i = 0; i < visibleImages.length; i++) {
      try {
        slide.addImage({
          path: visibleImages[i].fullUrl,
          x: MARGIN + i * (imgW + 0.2),
          y: imgY,
          w: imgW,
          h: imgH,
          sizing: { type: 'contain', w: imgW, h: imgH },
        })
      } catch {
        // Skip failed image
      }
    }
  } else if (layout === 'image-focused' && slideData.images[0]) {
    const image = slideData.images[0]
    const imgH = contentH * 0.75
    const captionY = contentY + imgH + 0.1

    try {
      slide.addImage({
        path: image.fullUrl,
        x: MARGIN,
        y: contentY,
        w: contentW,
        h: imgH,
        sizing: { type: 'contain', w: contentW, h: imgH },
      })
    } catch {
      // Skip failed image
    }

    if (plainContent) {
      slide.addText(truncate(plainContent, 200), {
        x: MARGIN,
        y: captionY,
        w: contentW,
        h: contentH - imgH - 0.1,
        fontSize: 12,
        fontFace: theme.fonts.body,
        color: toHex(theme.colors.text),
        valign: 'top',
        wrap: true,
      })
    }
  }

  // Speaker notes
  if (slideData.speakerNotes) {
    slide.addNotes(slideData.speakerNotes)
  }
}

function addCreditsSlide(
  pptx: pptxgen,
  slides: ExportSlideData[],
  theme: SlideTheme
): void {
  const credits = collectCredits(slides)
  if (credits.length === 0) return

  const slide = pptx.addSlide()
  slide.background = { color: toHex(theme.colors.background) }

  slide.addText('Image Credits', {
    x: MARGIN,
    y: 0.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.8,
    fontSize: 28,
    fontFace: theme.fonts.title,
    color: toHex(theme.colors.title),
    bold: true,
  })

  const creditLines = credits.map((c) => ({
    text: `Slide ${c.slideNumber}: "${c.imageTitle}" by ${c.creator} (${c.license || 'License unspecified'}) — ${c.source}`,
    options: {
      fontSize: 10,
      fontFace: theme.fonts.body,
      color: toHex(theme.colors.text),
      breakLine: true as const,
      paraSpaceAfter: 4,
    },
  }))

  slide.addText(creditLines, {
    x: MARGIN,
    y: 1.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: SLIDE_HEIGHT - 1.6,
    valign: 'top',
  })
}

export async function generatePPTX(
  projectTitle: string,
  slides: ExportSlideData[],
  options: ExportOptions,
  theme: SlideTheme,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  const pptx = new pptxgen()
  pptx.author = 'StoryStudio'
  pptx.title = projectTitle
  pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 → standard 16:9

  let slideIndex = 0
  let totalSlides = slides.length
  if (options.includeTitleSlide) totalSlides++
  if (options.includeTableOfContents) totalSlides++
  if (options.includeCreditsSlide) totalSlides++

  if (options.includeTitleSlide) {
    addTitleSlide(pptx, projectTitle, theme)
    slideIndex++
    onProgress?.(slideIndex, totalSlides, 'Creating title slide...')
  }

  if (options.includeTableOfContents) {
    addTOCSlide(pptx, slides, theme)
    slideIndex++
    onProgress?.(slideIndex, totalSlides, 'Creating table of contents...')
  }

  for (const slide of slides) {
    await addContentSlide(pptx, slide, options, theme)
    slideIndex++
    onProgress?.(slideIndex, totalSlides, `Creating slide ${slideIndex} of ${totalSlides}...`)
  }

  if (options.includeCreditsSlide) {
    addCreditsSlide(pptx, slides, theme)
    slideIndex++
    onProgress?.(slideIndex, totalSlides, 'Creating credits slide...')
  }

  return await pptx.write({ outputType: 'blob' }) as unknown as Blob
}
