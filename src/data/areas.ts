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

/** Ordonează un set de ținuturi după ordinea din joc. */
export function sortAreas(areas: AreaId[]): AreaId[] {
  return AREA_ORDER.filter((id) => areas.includes(id))
}
