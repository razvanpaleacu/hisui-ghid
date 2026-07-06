import type { Lang } from '../lib/i18n'

/** Cele cinci ținuturi deschise ale regiunii Hisui. */
export type AreaId =
  | 'obsidian-fieldlands'
  | 'crimson-mirelands'
  | 'cobalt-coastlands'
  | 'coronet-highlands'
  | 'alabaster-icelands'

/** Ordinea în care sunt deblocate zonele în joc. */
export const AREA_ORDER: AreaId[] = [
  'obsidian-fieldlands',
  'crimson-mirelands',
  'cobalt-coastlands',
  'coronet-highlands',
  'alabaster-icelands',
]

/** Numele ținuturilor, per limbă. */
export const AREA_NAMES: Record<Lang, Record<AreaId, string>> = {
  ro: {
    'obsidian-fieldlands': 'Câmpiile de Obsidian',
    'crimson-mirelands': 'Mlaștinile Purpurii',
    'cobalt-coastlands': 'Coasta de Cobalt',
    'coronet-highlands': 'Podișul Coronet',
    'alabaster-icelands': 'Ținuturile de Gheață Alabastru',
  },
  en: {
    'obsidian-fieldlands': 'Obsidian Fieldlands',
    'crimson-mirelands': 'Crimson Mirelands',
    'cobalt-coastlands': 'Cobalt Coastlands',
    'coronet-highlands': 'Coronet Highlands',
    'alabaster-icelands': 'Alabaster Icelands',
  },
}

/** Etichete scurte pentru hartă (numele complete nu încap în forme). */
export const AREA_SHORT: Record<Lang, Record<AreaId, string>> = {
  ro: {
    'obsidian-fieldlands': 'Obsidian',
    'crimson-mirelands': 'Mlaștini',
    'cobalt-coastlands': 'Cobalt',
    'coronet-highlands': 'Coronet',
    'alabaster-icelands': 'Alabastru',
  },
  en: {
    'obsidian-fieldlands': 'Obsidian',
    'crimson-mirelands': 'Crimson',
    'cobalt-coastlands': 'Cobalt',
    'coronet-highlands': 'Coronet',
    'alabaster-icelands': 'Alabaster',
  },
}

/** Scurtă descriere a fiecărui ținut, per limbă (pentru harta interactivă). */
export const AREA_DESCRIPTIONS: Record<Lang, Record<AreaId, string>> = {
  ro: {
    'obsidian-fieldlands':
      'Pajiști, păduri și râuri — prima zonă pe care o explorezi și locul ideal pentru primele capturi.',
    'crimson-mirelands':
      'Mlaștini cețoase și terenuri noroioase, casa multor Pokémoni de tip Pământ și Otravă.',
    'cobalt-coastlands':
      'Plaje, faleze și ape adânci, pline de Pokémoni de tip Apă și Zbor.',
    'coronet-highlands':
      'Drumul stâncos spre vârful muntelui Coronet, cu peșteri și Pokémoni de tip Rocă și Dragon.',
    'alabaster-icelands':
      'Tundra înghețată din nordul regiunii, cu viscol, gheață și Pokémoni rari.',
  },
  en: {
    'obsidian-fieldlands':
      'Meadows, forests and rivers — the first area you explore and the ideal place for early catches.',
    'crimson-mirelands':
      'Misty bogs and muddy terrain, home to many Ground- and Poison-type Pokémon.',
    'cobalt-coastlands':
      'Beaches, cliffs and deep waters, full of Water- and Flying-type Pokémon.',
    'coronet-highlands':
      'The rocky climb to the peak of Mount Coronet, with caves and Rock- and Dragon-type Pokémon.',
    'alabaster-icelands':
      'The frozen tundra in the north, with blizzards, ice and rare Pokémon.',
  },
}

/** Ordonează un set de ținuturi după ordinea din joc. */
export function sortAreas(areas: AreaId[]): AreaId[] {
  return AREA_ORDER.filter((id) => areas.includes(id))
}
