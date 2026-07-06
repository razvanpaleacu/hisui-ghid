import { useLanguage } from '../lib/i18n'

/** Buton care derulează în vârful paginii. Plasat în bara plutitoare din Layout. */
export default function BackToTop() {
  const { t } = useLanguage()

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={t('backToTop')}
      title={t('backToTop')}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-lg text-ink shadow-lg backdrop-blur transition-all hover:border-accent hover:text-accent active:scale-95"
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
