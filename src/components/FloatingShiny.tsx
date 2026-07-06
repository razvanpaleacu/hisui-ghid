import { useLanguage } from '../lib/i18n'
import { useShiny } from '../lib/shiny'

/** Comutator shiny plutitor, fixat pe ecran — mereu la îndemână, fără scroll. */
export default function FloatingShiny() {
  const { t } = useLanguage()
  const { shiny, toggle } = useShiny()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shiny}
      aria-label={t('shiny.aria')}
      onClick={toggle}
      className={`fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur transition-all active:scale-95 sm:bottom-6 sm:right-6 ${
        shiny
          ? 'border-transparent bg-accent text-white'
          : 'border-line bg-surface/90 text-ink hover:border-accent hover:text-accent'
      }`}
    >
      <span aria-hidden="true" className={shiny ? 'animate-pulse-slow' : ''}>
        ✦
      </span>
      Shiny
    </button>
  )
}
