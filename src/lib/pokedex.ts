import data from '../data/pokedex-hisui.json'
import type { PokedexEntry } from './types'

/** Pokédexul Hisui, generat la build de scripts/build-pokedex.mjs. */
export const pokedex = data as unknown as PokedexEntry[]

export const byName = new Map(pokedex.map((p) => [p.name, p]))
