import { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { LanguageProvider } from './lib/i18n'
import Ghid from './pages/Ghid'
import Mecanici from './pages/Mecanici'
import NotFound from './pages/NotFound'
import Tinuturi from './pages/Tinuturi'

// Pokédexul (împreună cu JSON-ul de date) se încarcă separat, ca să nu
// umfle bundle-ul inițial; Suspense-ul din Layout arată skeleton-uri.
const Pokedex = lazy(() => import('./pages/Pokedex'))
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'))

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Pokedex />} />
            <Route path="/pokedex/:name" element={<PokemonDetail />} />
            <Route path="/tinuturi" element={<Tinuturi />} />
            <Route path="/mecanici" element={<Mecanici />} />
            <Route path="/ghid" element={<Ghid />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </LanguageProvider>
  )
}
