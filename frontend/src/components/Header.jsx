import { MenuIcon } from './Icons.jsx';

function Header({ onMenuClick, onLogout, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-10 mb-6 border-b border-[color:var(--surface-border)] bg-[color:var(--surface)] transition-colors duration-300">
      <div className="app-main flex items-center justify-between gap-6 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-strong)] md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="page-title">Good morning, Sunil 👋</p>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">All data is based on selected filters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="btn-primary h-10 px-3 text-sm"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="btn-primary h-10 px-3 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
