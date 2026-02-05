export type LayoutType = 'text-only' | 'text-single-image' | 'text-multi-image' | 'image-focused'

export function selectLayout(contentLength: number, imageCount: number): LayoutType {
  if (imageCount === 0) return 'text-only'
  if (imageCount > 1) return 'text-multi-image'
  if (contentLength < 200) return 'image-focused'
  return 'text-single-image'
}
