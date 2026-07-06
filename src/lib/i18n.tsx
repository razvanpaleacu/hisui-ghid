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
  'theme.toggle': 'Schimbă tema',
  'theme.auto': 'Automat',
  'theme.light': 'Luminos',
  'theme.dark': 'Întunecat',
  'backToTop': 'Sus de tot',
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
  'common.originalFormBadge': 'Formă originală',
  'common.shinyAlt': ', versiune shiny',
  'form.label': 'Alege forma afișată',
  'form.hisui': 'Hisui',
  'form.original': 'Originală',
  'form.default': 'Standard',
  'form.origin': 'Origin',
  'form.altered': 'Altered',
  'form.sky': 'Sky',
  'form.land': 'Land',
  'form.therian': 'Therian',
  'form.incarnate': 'Incarnate',
  'form.male': 'Mascul',
  'form.female': 'Femelă',
  'sort.label': 'Sortează',
  'sort.dex': 'Număr',
  'sort.name': 'Nume',
  'sort.total': 'Total statistici',
  'sort.height': 'Înălțime',
  'sort.weight': 'Greutate',
  'sort.dirAsc': 'Crescător',
  'sort.dirDesc': 'Descrescător',
  'sort.dirToggle': 'Schimbă ordinea sortării',
  'map.intro':
    'Cele cinci ținuturi ale regiunii Hisui. Alege o zonă ca să vezi Pokémonii care apar acolo.',
  'map.selectHint': 'Alege un ținut de pe hartă.',
  'map.pokemonHere': 'Pokémon în această zonă',
  'map.openArea': 'Deschide {name}',
  'map.dragHint': 'Trage ca să te miști · rotița sau butoanele pentru zoom',
  'sort.location': 'Locație',
  'matchup.title': 'Slăbiciuni și rezistențe',
  'matchup.weak': 'Slab la',
  'matchup.resist': 'Rezistă la',
  'matchup.immune': 'Imun la',
  'evolution.title': 'Evoluție',
  'evolution.from': 'Evoluează din {name}',
  'behavior.title': 'Comportament în teren',
  'behavior.aggressive': 'Te atacă când te apropii',
  'behavior.skittish': 'Fuge de tine',
  'behavior.passive': 'Te ignoră',
  'behavior.wary': 'Precaut, te urmărește atent',
  'distortion.only': 'Se găsește doar în distorsiuni spațio-temporale',
  'pokedex.title': 'Pokédex Hisui',
  'pokedex.intro': 'Toți cei {count} din Pokémon Legends: Arceus.',
  'pokedex.searchLabel': 'Caută după nume, număr, tip, ținut sau formă',
  'pokedex.searchPlaceholder': 'Caută: nume, tip, ținut, formă… (ex. „ghost coronet")',
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
  'detail.locationsSpecial': 'Întâlnire specială — nu apare în sălbăticie.',
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
  'theme.toggle': 'Change theme',
  'theme.auto': 'Auto',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'backToTop': 'Back to top',
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
  'common.originalFormBadge': 'Original Form',
  'common.shinyAlt': ', shiny version',
  'form.label': 'Choose displayed form',
  'form.hisui': 'Hisui',
  'form.original': 'Original',
  'form.default': 'Standard',
  'form.origin': 'Origin',
  'form.altered': 'Altered',
  'form.sky': 'Sky',
  'form.land': 'Land',
  'form.therian': 'Therian',
  'form.incarnate': 'Incarnate',
  'form.male': 'Male',
  'form.female': 'Female',
  'sort.label': 'Sort',
  'sort.dex': 'Number',
  'sort.name': 'Name',
  'sort.total': 'Base stat total',
  'sort.height': 'Height',
  'sort.weight': 'Weight',
  'sort.dirAsc': 'Ascending',
  'sort.dirDesc': 'Descending',
  'sort.dirToggle': 'Toggle sort order',
  'map.intro':
    'The five areas of the Hisui region. Pick an area to see the Pokémon found there.',
  'map.selectHint': 'Select an area on the map.',
  'map.pokemonHere': 'Pokémon in this area',
  'map.openArea': 'Open {name}',
  'map.dragHint': 'Drag to pan · scroll or the buttons to zoom',
  'sort.location': 'Location',
  'matchup.title': 'Type matchups',
  'matchup.weak': 'Weak to',
  'matchup.resist': 'Resists',
  'matchup.immune': 'Immune to',
  'evolution.title': 'Evolution',
  'evolution.from': 'Evolves from {name}',
  'behavior.title': 'Field behavior',
  'behavior.aggressive': 'Attacks when you approach',
  'behavior.skittish': 'Flees from you',
  'behavior.passive': 'Ignores you',
  'behavior.wary': 'Wary — watches you closely',
  'distortion.only': 'Found only in space-time distortions',
  'pokedex.title': 'Hisui Pokédex',
  'pokedex.intro': 'All {count} from Pokémon Legends: Arceus.',
  'pokedex.searchLabel': 'Search by name, number, type, area or form',
  'pokedex.searchPlaceholder': 'Search: name, type, area, form… (e.g. “ghost coronet”)',
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
  'detail.locationsSpecial': 'Special encounter — not found in the wild.',
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
  lang: 'en',
  setLang: () => {},
  t: (key, params) => translate('en', key, params),
})

function initialLang(): Lang {
  // Site-ul e doar în engleză.
  return 'en'
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
