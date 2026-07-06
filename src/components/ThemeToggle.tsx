import { useState } from 'react'
import { useLanguage } from '../lib/i18n'
import { applyTheme, getTheme, type Theme } from '../lib/theme'

const ORDER: Theme[] = ['auto', 'light', 'dark']
const ICON: Record<Theme, string> = { auto: '◐', light: '☀', dark: '☾' }

export default function ThemeToggle() {
  const { t } = useLanguage()
  const [theme, setThemeState] = useState<Theme>(getTheme)

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
    setThemeState(next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${t('theme.toggle')}: ${t(`theme.${theme}` as 'theme.auto')}`}
      title={t(`theme.${theme}` as 'theme.auto')}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span aria-hidden="true">{ICON[theme]}</span>
    </button>
  )
}
