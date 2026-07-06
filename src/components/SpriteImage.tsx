import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../lib/i18n'

interface Props {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

const MAX_RETRY = 4

/**
 * Imagine cu skeleton cât se încarcă, reîncercare la eroare și fallback „?".
 * Sprite-urile vin de la githubusercontent, care limitează rata când se cer
 * multe deodată — de aceea reîncercăm de câteva ori înainte să renunțăm.
 */
export default function SpriteImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: Props) {
  const { t } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const timer = useRef<number>()

  // La schimbarea sursei o luăm de la capăt.
  useEffect(() => {
    setAttempt(0)
    setStatus('loading')
  }, [src])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleError = () => {
    if (attempt < MAX_RETRY) {
      // Backoff crescător (+jitter) înainte de o nouă încercare.
      timer.current = window.setTimeout(
        () => setAttempt((a) => a + 1),
        400 + attempt * 500 + Math.random() * 300,
      )
    } else {
      setStatus('error')
    }
  }

  // Imaginile din cache pot fi deja „complete" înainte de onLoad/onError.
  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (img.complete) {
      if (img.naturalWidth > 0) setStatus('ok')
      else handleError()
    } else {
      setStatus('loading')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, attempt])

  if (status === 'error') {
    return (
      <div
        role="img"
        aria-label={`${alt} ${t('sprite.errorSuffix')}`}
        className={`flex items-center justify-center rounded-lg bg-line/40 ${className}`}
      >
        <span aria-hidden="true" className="text-2xl text-muted">
          ?
        </span>
      </div>
    )
  }

  // La reîncercări adăugăm un parametru ca să forțăm o cerere nouă.
  const imgSrc =
    attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}r=${attempt}`

  return (
    <div className={`relative ${className}`}>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse rounded-lg bg-line/60"
        />
      )}
      <img
        ref={imgRef}
        key={attempt}
        src={imgSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setStatus('ok')}
        onError={handleError}
        className={`h-full w-full object-contain transition-opacity duration-200 ${
          status === 'ok' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
