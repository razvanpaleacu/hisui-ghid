import { Suspense, useLayoutEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLanguage, type StringKey } from '../lib/i18n'
import ErrorBoundary from './ErrorBoundary'
import FloatingShiny from './FloatingShiny'
import LanguageSelector from './LanguageSelector'
import PageLoading from './PageLoading'

const TABS: { to: string; labelKey: StringKey; isActive: (path: string) => boolean }[] = [
  {
    to: '/',
    labelKey: 'nav.pokedex',
    isActive: (path) => path === '/' || path.startsWith('/pokedex'),
  },
  {
    to: '/tinuturi',
    labelKey: 'nav.tinuturi',
    isActive: (path) => path.startsWith('/tinuturi'),
  },
  {
    to: '/mecanici',
    labelKey: 'nav.mecanici',
    isActive: (path) => path.startsWith('/mecanici'),
  },
  {
    to: '/ghid',
    labelKey: 'nav.ghid',
    isActive: (path) => path.startsWith('/ghid'),
  },
]

export default function Layout() {
  const { pathname } = useLocation()
  const { t } = useLanguage()

  // La schimbarea paginii urcăm sus — excepție face Pokédexul („/"), care își
  // restaurează singur poziția de scroll ca să nu pierzi locul din grilă.
  useLayoutEffect(() => {
    if (pathname !== '/') window.scrollTo(0, 0)
  }, [pathname])

  // Butonul shiny apare pe paginile cu sprite-uri (grilă, detaliu, hartă).
  const showShiny =
    pathname === '/' ||
    pathname.startsWith('/pokedex') ||
    pathname.startsWith('/tinuturi')

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto w-full max-w-page px-4 sm:px-6">
          <div className="flex items-center gap-3 pt-5">
            <Link
              to="/"
              className="text-xl font-semibold leading-none tracking-tight"
            >
              Hisui
            </Link>
            <span className="text-sm text-muted">{t('site.tagline')}</span>
            <div className="ml-auto">
              <LanguageSelector />
            </div>
          </div>
          <nav
            aria-label={t('nav.aria')}
            className="-mb-px mt-1 flex gap-1 overflow-x-auto"
          >
            {TABS.map((tab) => {
              const active = tab.isActive(pathname)
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'border-accent text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {t(tab.labelKey)}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-page px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
          <p>{t('footer.disclaimer')}</p>
          <p className="mt-1">
            {t('footer.credit')}{' '}
            <a
              href="https://pokeapi.co"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:underline"
            >
              PokéAPI
            </a>
            .
          </p>
        </div>
      </footer>

      {showShiny && <FloatingShiny />}
    </>
  )
}
