import type { Lang } from './i18n'

export type TypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

export interface PokemonSprites {
  normal: string
  shiny: string
  artwork: string
  artworkShiny: string
}

/**
 * O formă selectabilă a unui Pokémon: forma Hisui vs originală, regionale
 * (Alola/Galar/Paldea), Origin/Therian/Sky, mascul/femelă, Cherrim etc.
 * `label` e eticheta bilingvă gata tradusă.
 */
export interface PokemonForm {
  key: string
  label: Record<Lang, string>
  id: number
  name: string
  types: TypeName[]
  stats: PokemonStats
  height: number
  weight: number
  sprites: PokemonSprites
}

export interface PokedexEntry {
  /** Numărul din Pokédexul Hisui (1–242). */
  dexNumber: number
  /** Id-ul PokéAPI al formei afișate (≥ 10000 pentru formele Hisui). */
  id: number
  /** Numărul din Pokédexul național (id-ul speciei). */
  nationalDex: number
  /** Numele PokéAPI al formei — folosit în rută (ex. "growlithe-hisui"). */
  name: string
  displayName: string
  types: TypeName[]
  stats: PokemonStats
  /** Înălțime în decimetri (convenția PokéAPI). */
  height: number
  /** Greutate în hectograme (convenția PokéAPI). */
  weight: number
  isHisuianForm: boolean
  sprites: PokemonSprites
  /** Zonele din Hisui unde apare — completate manual, ulterior. */
  locations: string[]
  /**
   * Formele selectabile (când sunt ≥ 2). Prima e forma principală, identică
   * cu datele de sus. Absent când Pokémonul are o singură formă.
   */
  forms?: PokemonForm[]
}
