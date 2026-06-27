"use client"

export function CanvasControls({
  scale,
  onReset,
}: {
  scale: number
  onReset: () => void
}) {
  return (
    <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2">
      <button
        onClick={onReset}
        className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-mono text-gray-600 hover:bg-white hover:shadow-lg transition-all active:scale-95"
        title="Reset zoom"
      >
        {Math.round(scale * 100)}%
      </button>
    </div>
  )
}
