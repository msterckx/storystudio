'use client'

export function ImageSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  )
}
