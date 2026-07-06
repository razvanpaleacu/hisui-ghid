import { Component, type ContextType, type ReactNode } from 'react'
import { LanguageContext } from '../lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  static contextType = LanguageContext
  declare context: ContextType<typeof LanguageContext>

  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.context
      return (
        <div
          role="alert"
          className="mx-auto max-w-md rounded-xl border border-line bg-surface px-6 py-12 text-center"
        >
          <h2 className="text-base font-semibold">{t('error.title')}</h2>
          <p className="mt-2 text-sm text-muted">{t('error.body')}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent"
          >
            {t('error.retry')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
