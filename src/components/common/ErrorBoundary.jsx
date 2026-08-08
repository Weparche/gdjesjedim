import { Component } from 'react'

// Render-time errors can only be caught by a class component implementing
// componentDidCatch/getDerivedStateFromError — hooks cannot catch them.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
          <p className="font-ui text-base text-charcoal">Nešto je pošlo po krivu. Pokušajte ponovno.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-gold px-6 font-ui text-base font-semibold text-charcoal shadow-card transition-colors hover:bg-gold-deep"
          >
            Osvježi stranicu
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
