import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../lib/i18n'

interface Props {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Imagine cu skeleton cât se încarcă și fallback discret la eroare.
 * Sursele vin la runtime din repository-ul de sprite-uri PokéAPI.
 */
export default function SpriteImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: Props) {
  const { t } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // La imagini din cache, evenimentul `load` poate sosi înaintea acestui
    // efect; ne uităm direct la starea elementului ca să nu rămânem blocați
    // pe „loading" (și implicit pe opacity-0).
    const img = imgRef.current
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? 'ok' : 'error')
    } else {
      setStatus('loading')
    }
  }, [src])

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
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
        className={`h-full w-full object-contain transition-opacity duration-200 ${
          status === 'ok' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
