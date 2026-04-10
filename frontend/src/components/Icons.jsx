function IconWrapper({ children, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      {children}
    </svg>
  );
}

export function DashboardIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
      <rect x="13.5" y="9.5" width="7" height="11" rx="1.5" />
      <rect x="3.5" y="12.5" width="7" height="8" rx="1.5" />
    </IconWrapper>
  );
}

export function CustomersIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="9.5" r="2.5" />
      <path d="M3.5 18c0-2.5 2.2-4.5 4.5-4.5S12.5 15.5 12.5 18" />
      <path d="M13 18c.2-1.8 1.8-3 3.6-3 1.9 0 3.4 1.2 3.9 3" />
    </IconWrapper>
  );
}

export function OrdersIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4 6.5h16" />
      <path d="M7 3.5v3" />
      <path d="M17 3.5v3" />
      <rect x="4" y="6.5" width="16" height="14" rx="2" />
      <path d="M8 11.5h8" />
      <path d="M8 15.5h5" />
    </IconWrapper>
  );
}

export function ExpensesIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M6.5 4.5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z" />
      <path d="M9 9.5h6" />
      <path d="M9 13h6" />
      <path d="M12 8v8" />
    </IconWrapper>
  );
}

export function CompanyIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4.5 19.5h15" />
      <rect x="6" y="5" width="12" height="14" rx="1.5" />
      <path d="M9 9h1" />
      <path d="M14 9h1" />
      <path d="M9 12h1" />
      <path d="M14 12h1" />
      <path d="M11.5 19.5v-3h1v3" />
    </IconWrapper>
  );
}

export function ProductIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 6v12" />
    </IconWrapper>
  );
}

export function PurchaseIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5z" />
      <path d="M7.5 9.5h9" />
      <path d="M7.5 13h6" />
    </IconWrapper>
  );
}

export function SettingsIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.9 7.9 0 0 0 .1-1.5 7.9 7.9 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a8.9 8.9 0 0 0-2.6-1.5l-.4-2.6H10l-.4 2.6a8.9 8.9 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.9 7.9 0 0 0-.1 1.5c0 .5 0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a8.9 8.9 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a8.9 8.9 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5z" />
    </IconWrapper>
  );
}

export function RevenueIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4 18.5h16" />
      <path d="M6.5 15.5l4-4 3 2 4-5" />
      <path d="M16.5 8.5h2.5V11" />
    </IconWrapper>
  );
}

export function ProfitIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 13.5c.7 1 1.8 1.5 3 1.5 1.4 0 2.5-.8 2.5-2 0-3-5.8-1.4-5.8-4.4 0-1.4 1.2-2.4 2.9-2.4 1.1 0 2 .4 2.7 1.2" />
      <path d="M12 5.8v12.4" />
    </IconWrapper>
  );
}

export function MenuIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconWrapper>
  );
}

export function MoonIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <path d="M15.2 3.8a8.6 8.6 0 1 0 5 13.5A7.2 7.2 0 0 1 15.2 3.8z" />
    </IconWrapper>
  );
}

export function SunIcon({ className }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v2.2" />
      <path d="M12 18.3v2.2" />
      <path d="M20.5 12h-2.2" />
      <path d="M5.7 12H3.5" />
      <path d="M18.2 5.8l-1.5 1.5" />
      <path d="M7.3 16.7l-1.5 1.5" />
      <path d="M18.2 18.2l-1.5-1.5" />
      <path d="M7.3 7.3 5.8 5.8" />
    </IconWrapper>
  );
}
