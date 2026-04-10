import { NavLink } from 'react-router-dom';
import { CompanyIcon, CustomersIcon, DashboardIcon, ExpensesIcon, OrdersIcon, ProductIcon, PurchaseIcon, SettingsIcon } from './Icons.jsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Companies', path: '/companies', icon: CompanyIcon },
  { label: 'Customers', path: '/customers', icon: CustomersIcon },
  { label: 'Products', path: '/products', icon: ProductIcon },
  { label: 'Purchases', path: '/purchases', icon: PurchaseIcon },
  { label: 'Sales', path: '/sales', icon: OrdersIcon },
  { label: 'Expenses', path: '/expenses', icon: ExpensesIcon },
  { label: 'Settings', path: '/settings', icon: SettingsIcon }
];

function Sidebar({ open, onClose }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 w-64 transform border-r border-[color:var(--surface-border)] bg-[color:var(--surface)] transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between border-b border-[color:var(--surface-border)] p-6">
        <div>
          <p className="text-base font-semibold text-[color:var(--text-strong)]">Om Swami Samarth</p>
          <p className="text-xs text-[color:var(--text-muted)] mt-1">Agencies</p>
        </div>
        <button className="rounded-md p-1 text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)] md:hidden" onClick={onClose}>
          ✕
        </button>
      </div>

      <nav className="space-y-2 p-6">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[color:var(--accent-blue)] text-white'
                  : 'text-[color:var(--text-soft)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-strong)]'
              }`
            }
            onClick={onClose}
          >
            {({ isActive }) => (
              <>
                <NavIcon className="h-4 w-4" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
