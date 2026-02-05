const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'

export interface WikimediaImage {
  id: string
  thumbnailUrl: string
  fullUrl: string
  source: string
  sourceUrl: string
  license: string
  title: string
  creator: string
  date: string
}

interface WikimediaPage {
  pageid: number
  title: string
  imageinfo?: Array<{
    url: string
    thumburl?: string
    descriptionurl: string
    extmetadata?: {
      LicenseShortName?: { value: string }
      Artist?: { value: string }
      DateTimeOriginal?: { value: string }
      ObjectName?: { value: string }
      ImageDescription?: { value: string }
    }
  }>
}

interface WikimediaResponse {
  query?: {
    pages?: Record<string, WikimediaPage>
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function searchWikimediaImages(
  query: string,
  limit: number = 12
): Promise<WikimediaImage[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: String(limit),
    gsrnamespace: '6', // File namespace
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '300', // Thumbnail width
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`${WIKIMEDIA_API}?${params}`)

  if (!response.ok) {
    console.error('Wikimedia API error:', response.status)
    return []
  }

  const data = (await response.json()) as WikimediaResponse

  if (!data.query?.pages) {
    return []
  }

  const results: WikimediaImage[] = []

  for (const page of Object.values(data.query.pages)) {
    const info = page.imageinfo?.[0]
    if (!info?.url) continue

    // Skip SVG, GIF, and very small images
    if (info.url.match(/\.(svg|gif)$/i)) continue

    const meta = info.extmetadata || {}

    results.push({
      id: `wikimedia-${page.pageid}`,
      thumbnailUrl: info.thumburl || info.url,
      fullUrl: info.url,
      source: 'Wikimedia Commons',
      sourceUrl: info.descriptionurl,
      license: meta.LicenseShortName?.value || 'Unknown',
      title: meta.ObjectName?.value || page.title.replace(/^File:/, ''),
      creator: meta.Artist?.value ? stripHtml(meta.Artist.value) : '',
      date: meta.DateTimeOriginal?.value || '',
    })
  }

  return results
}
