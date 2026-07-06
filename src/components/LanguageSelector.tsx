import { useLanguage, type Lang } from '../lib/i18n'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ro', label: 'RO' },
  { value: 'en', label: 'EN' },
]

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('lang.aria')}
      className="inline-flex items-center rounded-full border border-line bg-surface p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.value === lang
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            aria-pressed={active}
            onClick={() => setLang(option.value)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              active ? 'bg-accent text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
