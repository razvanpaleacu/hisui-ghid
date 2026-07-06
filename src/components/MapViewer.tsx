import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  alt: string
}

const MIN = 1
const MAX = 6

interface Transform {
  s: number
  x: number
  y: number
}

/** Vizualizator de hartă cu pan (tragere) și zoom (rotiță / butoane). */
export default function MapViewer({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null,
  )
  const [tf, setTf] = useState<Transform>({ s: 1, x: 0, y: 0 })

  // Resetăm poziția când se schimbă harta.
  useEffect(() => {
    setTf({ s: 1, x: 0, y: 0 })
  }, [src])

  const zoomAt = (cx: number, cy: number, factor: number) => {
    setTf((p) => {
      const s = Math.min(MAX, Math.max(MIN, p.s * factor))
      const k = s / p.s
      return { s, x: cx - (cx - p.x) * k, y: cy - (cy - p.y) * k }
    })
  }

  // Zoom spre cursor cu rotița (listener nativ ca să putem preveni scroll-ul).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.15 : 1 / 1.15)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoomButton = (factor: number) => {
    const el = containerRef.current
    if (el) zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: tf.x, y: tf.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    setTf((p) => ({
      ...p,
      x: d.x + (e.clientX - d.px),
      y: d.y + (e.clientY - d.py),
    }))
  }
  const endDrag = () => {
    drag.current = null
  }

  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-lg text-ink shadow-sm backdrop-blur transition-colors hover:border-accent hover:text-accent'

  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] min-h-[320px] cursor-grab touch-none select-none overflow-hidden rounded-xl border border-line active:cursor-grabbing"
      style={{ background: 'var(--map-board)' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute left-0 top-0 w-full max-w-none origin-top-left"
        style={{ transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.s})` }}
      />
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button type="button" aria-label="Zoom in" onClick={() => zoomButton(1.4)} className={btn}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomButton(1 / 1.4)} className={btn}>
          −
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => setTf({ s: 1, x: 0, y: 0 })}
          className={btn}
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
