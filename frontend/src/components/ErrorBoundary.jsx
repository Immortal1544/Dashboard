import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep noisy stack traces out of UI while still preserving logs for debugging.
    console.error('Unhandled UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[color:var(--app-bg)] p-6 text-[color:var(--text-strong)]">
          <div className="mx-auto max-w-xl rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-6">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              The dashboard hit an unexpected issue. Refresh the page and try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
