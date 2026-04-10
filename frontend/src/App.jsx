import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Companies from './pages/Companies.jsx';
import Customers from './pages/Customers.jsx';
import Orders from './pages/Orders.jsx';
import Expenses from './pages/Expenses.jsx';
import Products from './pages/Products.jsx';
import Purchases from './pages/Purchases.jsx';
import Login from './pages/Login.jsx';
import Settings from './pages/Settings.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import ToastHost from './components/ToastHost.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (token) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken('');
  };

  if (!authToken) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--text-strong)] transition-colors duration-300">
        <div className="flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 min-h-screen">
            <Header
              onMenuClick={() => setSidebarOpen((prev) => !prev)}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <main className="app-main">
              <Routes>
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Orders />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/settings" element={<Settings onAccountUpdated={handleLogin} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
        <ToastHost />
      </div>
    </ErrorBoundary>
  );
}

export default App;
