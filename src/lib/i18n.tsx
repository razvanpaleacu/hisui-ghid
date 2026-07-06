import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'ro' | 'en'

const STORAGE_KEY = 'hisui-lang'

const STRINGS_RO = {
  'site.tagline': 'Ghid Legends: Arceus',
  'site.pageTitleSuffix': ' — Hisui, Ghid Legends: Arceus',
  'nav.aria': 'Navigare principală',
  'nav.pokedex': 'Pokédex',
  'nav.tinuturi': 'Ținuturile Hisui',
  'nav.mecanici': 'Mecanici',
  'nav.ghid': 'Ghid & Sfaturi',
  'lang.aria': 'Schimbă limba',
  'footer.disclaimer':
    'Proiect de fan, neoficial — neafiliat cu Nintendo, Game Freak sau The Pokémon Company. Pokémon și Pokémon Legends: Arceus sunt mărci ale deținătorilor lor.',
  'footer.credit': 'Date și imagini furnizate de',
  'loading': 'Se încarcă…',
  'error.title': 'A apărut o eroare',
  'error.body': 'Ceva nu a mers bine la afișarea acestei pagini.',
  'error.retry': 'Reîncearcă',
  'shiny.aria': 'Afișează versiunile shiny',
  'sprite.errorSuffix': '— imaginea nu a putut fi încărcată',
  'common.hisuiForm': 'formă Hisui',
  'common.hisuiFormBadge': 'Formă Hisui',
  'common.shinyAlt': ', versiune shiny',
  'pokedex.title': 'Pokédex Hisui',
  'pokedex.intro': 'Toți cei {count} din Pokémon Legends: Arceus.',
  'pokedex.searchLabel': 'Caută după nume sau număr',
  'pokedex.searchPlaceholder': 'Caută după nume sau număr…',
  'pokedex.filterAria': 'Filtrează după tip',
  'pokedex.clearFilters': 'Șterge filtrele',
  'pokedex.emptyTitle': 'Niciun Pokémon găsit',
  'pokedex.emptyHint': 'Încearcă alt nume sau elimină filtrele de tip.',
  'pokedex.resetFilters': 'Resetează filtrele',
  'detail.back': '← Înapoi la Pokédex',
  'detail.prevAria': 'Intrarea anterioară: {name}',
  'detail.nextAria': 'Intrarea următoare: {name}',
  'detail.hisuiNo': 'Hisui',
  'detail.nationalNo': 'Național',
  'detail.height': 'Înălțime',
  'detail.weight': 'Greutate',
  'detail.stats': 'Statistici de bază',
  'detail.total': 'Total:',
  'detail.locations': 'Unde îl găsești',
  'detail.locationsSoon': 'Locații: în curând.',
  'detail.pageTitle': '{name} — Pokédex Hisui',
  'detail.notFoundTitle': 'Pokémon negăsit',
  'detail.notFoundBody':
    'Nu există nicio intrare cu numele „{name}” în Pokédexul Hisui.',
  'detail.notFoundPageTitle': 'Pokémon negăsit — Hisui',
  'stub.soon': 'În curând',
  'notfound.title': 'Pagina nu există',
  'notfound.body': 'Adresa accesată nu corespunde niciunei pagini din ghid.',
  'notfound.pageTitle': 'Pagină negăsită — Hisui, Ghid Legends: Arceus',
} as const

export type StringKey = keyof typeof STRINGS_RO

const STRINGS_EN: Record<StringKey, string> = {
  'site.tagline': 'Legends: Arceus Guide',
  'site.pageTitleSuffix': ' — Hisui, Legends: Arceus Guide',
  'nav.aria': 'Main navigation',
  'nav.pokedex': 'Pokédex',
  'nav.tinuturi': 'Hisui Areas',
  'nav.mecanici': 'Mechanics',
  'nav.ghid': 'Guide & Tips',
  'lang.aria': 'Change language',
  'footer.disclaimer':
    'Unofficial fan project — not affiliated with Nintendo, Game Freak or The Pokémon Company. Pokémon and Pokémon Legends: Arceus are trademarks of their respective owners.',
  'footer.credit': 'Data and images provided by',
  'loading': 'Loading…',
  'error.title': 'Something went wrong',
  'error.body': 'This page failed to display properly.',
  'error.retry': 'Try again',
  'shiny.aria': 'Show shiny versions',
  'sprite.errorSuffix': '— the image could not be loaded',
  'common.hisuiForm': 'Hisuian form',
  'common.hisuiFormBadge': 'Hisuian Form',
  'common.shinyAlt': ', shiny version',
  'pokedex.title': 'Hisui Pokédex',
  'pokedex.intro': 'All {count} from Pokémon Legends: Arceus.',
  'pokedex.searchLabel': 'Search by name or number',
  'pokedex.searchPlaceholder': 'Search by name or number…',
  'pokedex.filterAria': 'Filter by type',
  'pokedex.clearFilters': 'Clear filters',
  'pokedex.emptyTitle': 'No Pokémon found',
  'pokedex.emptyHint': 'Try a different name or remove the type filters.',
  'pokedex.resetFilters': 'Reset filters',
  'detail.back': '← Back to Pokédex',
  'detail.prevAria': 'Previous entry: {name}',
  'detail.nextAria': 'Next entry: {name}',
  'detail.hisuiNo': 'Hisui',
  'detail.nationalNo': 'National',
  'detail.height': 'Height',
  'detail.weight': 'Weight',
  'detail.stats': 'Base stats',
  'detail.total': 'Total:',
  'detail.locations': 'Where to find it',
  'detail.locationsSoon': 'Locations: coming soon.',
  'detail.pageTitle': '{name} — Hisui Pokédex',
  'detail.notFoundTitle': 'Pokémon not found',
  'detail.notFoundBody':
    'There is no entry named “{name}” in the Hisui Pokédex.',
  'detail.notFoundPageTitle': 'Pokémon not found — Hisui',
  'stub.soon': 'Coming soon',
  'notfound.title': 'Page not found',
  'notfound.body': 'The address you visited does not match any page in this guide.',
  'notfound.pageTitle': 'Page not found — Hisui, Legends: Arceus Guide',
}

const STRINGS: Record<Lang, Record<StringKey, string>> = {
  ro: STRINGS_RO,
  en: STRINGS_EN,
}

export type TranslateFn = (
  key: StringKey,
  params?: Record<string, string | number>,
) => string

function translate(
  lang: Lang,
  key: StringKey,
  params?: Record<string, string | number>,
): string {
  let text = STRINGS[lang][key]
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TranslateFn
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ro',
  setLang: () => {},
  t: (key, params) => translate('ro', key, params),
})

function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ro'
  } catch {
    return 'ro'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage indisponibil (ex. mod privat) — limba rămâne doar în memorie.
    }
  }, [lang])

  const t = useCallback<TranslateFn>(
    (key, params) => translate(lang, key, params),
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
