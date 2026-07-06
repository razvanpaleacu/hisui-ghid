import type { Lang } from './i18n'
import type { PokemonStats } from './types'

const LOCALES: Record<Lang, string> = {
  ro: 'ro-RO',
  en: 'en-US',
}

/** #7 → „#007" */
export function formatDexNumber(n: number): string {
  return `#${String(n).padStart(3, '0')}`
}

/** Decimetri → „0,7 m" (ro) / "0.7 m" (en). */
export function formatHeight(decimeters: number, lang: Lang): string {
  return `${(decimeters / 10).toLocaleString(LOCALES[lang])} m`
}

/** Hectograme → „22,7 kg" (ro) / "22.7 kg" (en). */
export function formatWeight(hectograms: number, lang: Lang): string {
  return `${(hectograms / 10).toLocaleString(LOCALES[lang])} kg`
}

export const STAT_LABELS: Record<Lang, Record<keyof PokemonStats, string>> = {
  ro: {
    hp: 'PV',
    attack: 'Atac',
    defense: 'Apărare',
    specialAttack: 'Atac special',
    specialDefense: 'Apărare specială',
    speed: 'Viteză',
  },
  en: {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    specialAttack: 'Special Attack',
    specialDefense: 'Special Defense',
    speed: 'Speed',
  },
}

export const STAT_ORDER: (keyof PokemonStats)[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
]

/** Valoarea maximă teoretică a unei statistici de bază (Blissey are PV 255). */
export const STAT_MAX = 255

/**
 * Numărul cu substantivul potrivit:
 * ro: „1 Pokémon", „5 Pokémon", „242 de Pokémon" (regula lui „de" la ≥ 20);
 * en: invariabil — "242 Pokémon".
 */
export function formatPokemonCount(n: number, lang: Lang): string {
  if (lang === 'en') return `${n} Pokémon`
  const lastTwo = n % 100
  // „de" apare de la 20 în sus, dar nu la compusele terminate în 01–19
  // (ex. „101 Pokémon", „119 Pokémon", dar „120 de Pokémon").
  const needsDe = n >= 20 && (lastTwo === 0 || lastTwo >= 20)
  return `${n}${needsDe ? ' de' : ''} Pokémon`
}
