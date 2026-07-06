import type { TypeName } from './types'
import { ALL_TYPES } from './typeInfo'

/**
 * Tabelul de eficacitate al tipurilor (Gen 6+, cu Fairy). Pentru fiecare tip
 * atacator, sunt listate doar tipurile apărătoare unde multiplicatorul ≠ 1.
 */
const TYPE_CHART: Record<TypeName, Partial<Record<TypeName, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5,
    bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5,
    rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2,
    ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

export interface Matchup {
  type: TypeName
  multiplier: number
}

export interface DefensiveMatchups {
  weak: Matchup[]
  resist: Matchup[]
  immune: Matchup[]
}

/** Multiplicatorul defensiv al unui Pokémon (una sau două tipuri) față de un atac. */
function defensiveMultiplier(attack: TypeName, defenderTypes: TypeName[]): number {
  return defenderTypes.reduce(
    (mult, t) => mult * (TYPE_CHART[attack][t] ?? 1),
    1,
  )
}

/** Slăbiciunile, rezistențele și imunitățile unui Pokémon după tipurile lui. */
export function defensiveMatchups(types: TypeName[]): DefensiveMatchups {
  const weak: Matchup[] = []
  const resist: Matchup[] = []
  const immune: Matchup[] = []

  for (const attack of ALL_TYPES) {
    const m = defensiveMultiplier(attack, types)
    if (m === 0) immune.push({ type: attack, multiplier: 0 })
    else if (m > 1) weak.push({ type: attack, multiplier: m })
    else if (m < 1) resist.push({ type: attack, multiplier: m })
  }

  weak.sort((a, b) => b.multiplier - a.multiplier)
  resist.sort((a, b) => a.multiplier - b.multiplier)
  return { weak, resist, immune }
}

/** „×2", „×½", „×¼", „×0" — pentru afișare. */
export function formatMultiplier(m: number): string {
  if (m === 0.25) return '×¼'
  if (m === 0.5) return '×½'
  if (m === 0) return '×0'
  return `×${m}`
}
