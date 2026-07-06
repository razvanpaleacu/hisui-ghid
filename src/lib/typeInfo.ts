import type { Lang } from './i18n'
import type { TypeName } from './types'

/** Paleta standard de culori pentru tipurile Pokémon. */
export const TYPE_COLORS: Record<TypeName, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
}

/** Denumirile tipurilor, per limbă. */
export const TYPE_LABELS: Record<Lang, Record<TypeName, string>> = {
  ro: {
    normal: 'Normal',
    fire: 'Foc',
    water: 'Apă',
    electric: 'Electric',
    grass: 'Iarbă',
    ice: 'Gheață',
    fighting: 'Luptă',
    poison: 'Otravă',
    ground: 'Pământ',
    flying: 'Zbor',
    psychic: 'Psihic',
    bug: 'Insectă',
    rock: 'Rocă',
    ghost: 'Fantomă',
    dragon: 'Dragon',
    dark: 'Întuneric',
    steel: 'Oțel',
    fairy: 'Zână',
  },
  en: {
    normal: 'Normal',
    fire: 'Fire',
    water: 'Water',
    electric: 'Electric',
    grass: 'Grass',
    ice: 'Ice',
    fighting: 'Fighting',
    poison: 'Poison',
    ground: 'Ground',
    flying: 'Flying',
    psychic: 'Psychic',
    bug: 'Bug',
    rock: 'Rock',
    ghost: 'Ghost',
    dragon: 'Dragon',
    dark: 'Dark',
    steel: 'Steel',
    fairy: 'Fairy',
  },
}

export const ALL_TYPES = Object.keys(TYPE_COLORS) as TypeName[]

/** Tipuri cu fundal deschis, care au nevoie de text închis pentru contrast. */
const LIGHT_TYPES = new Set<TypeName>([
  'normal',
  'electric',
  'grass',
  'ice',
  'ground',
  'flying',
  'bug',
  'rock',
  'steel',
  'fairy',
])

export function typeTextColor(type: TypeName): string {
  return LIGHT_TYPES.has(type) ? '#1A1A1A' : '#FFFFFF'
}
