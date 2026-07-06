import { useLanguage } from '../lib/i18n'

interface Props {
  checked: boolean
  onChange: (value: boolean) => void
}

export default function ShinyToggle({ checked, onChange }: Props) {
  const { t } = useLanguage()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={t('shiny.aria')}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm font-medium text-ink"
    >
      <span aria-hidden="true">✦</span>
      <span>Shiny</span>
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-line'
        }`}
      >
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full border border-line bg-surface shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
