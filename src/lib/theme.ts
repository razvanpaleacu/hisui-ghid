export type Theme = 'auto' | 'light' | 'dark'

const KEY = 'hisui-theme'

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'auto') return v
  } catch {
    // localStorage indisponibil
  }
  return 'auto'
}

/** Aplică tema pe <html> (data-theme) și o salvează. 'auto' urmează device-ul. */
export function applyTheme(theme: Theme) {
  const el = document.documentElement
  if (theme === 'auto') delete el.dataset.theme
  else el.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // ignorăm
  }
}

/** Aplică tema salvată la pornire (fără să o rescrie), ca să nu apară un flash. */
export function initTheme() {
  const el = document.documentElement
  const theme = getTheme()
  if (theme === 'auto') delete el.dataset.theme
  else el.dataset.theme = theme
}
