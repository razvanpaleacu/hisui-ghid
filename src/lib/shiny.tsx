import { createContext, useContext, useState, type ReactNode } from 'react'

interface ShinyContextValue {
  shiny: boolean
  setShiny: (value: boolean) => void
  toggle: () => void
}

const ShinyContext = createContext<ShinyContextValue>({
  shiny: false,
  setShiny: () => {},
  toggle: () => {},
})

/**
 * Stare shiny globală, comună grilei și paginii de detaliu, ca butonul plutitor
 * să comute totul deodată și să fie mereu pe ecran.
 */
export function ShinyProvider({ children }: { children: ReactNode }) {
  const [shiny, setShiny] = useState(false)
  return (
    <ShinyContext.Provider
      value={{ shiny, setShiny, toggle: () => setShiny((s) => !s) }}
    >
      {children}
    </ShinyContext.Provider>
  )
}

export function useShiny() {
  return useContext(ShinyContext)
}
