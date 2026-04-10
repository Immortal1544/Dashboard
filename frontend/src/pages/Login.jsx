import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser } from '../services/api.js';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canSubmit = Boolean(username.trim() && password && !loading);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser({ username, password });
      const token = response?.token;

      if (!token) {
        throw new Error('Login failed. Token not received.');
      }

      localStorage.setItem('authToken', token);
      onLogin(token);
    } catch (loginError) {
      setError(loginError.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[color:var(--app-bg)] px-4 py-6 md:px-8">
      <img
        src="/img1.jpg"
        alt="img1"
        className="pointer-events-none absolute left-8 top-8 hidden h-36 w-36 rounded-xl border border-[#E5E7EB] object-cover shadow-sm transition-colors duration-300 dark:border-[#1F2937] md:block"
      />

      <img
        src="/img2.jpg"
        alt="img2"
        className="pointer-events-none absolute right-8 top-8 hidden h-36 w-36 rounded-xl border border-[#E5E7EB] object-cover shadow-sm transition-colors duration-300 dark:border-[#1F2937] md:block"
      />

      <div className="mx-auto flex w-full max-w-5xl justify-center pt-2">
        <p className="text-center text-base font-semibold tracking-wide text-yellow-400 md:text-lg">|| श्री गणेशाय नमः ||</p>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center justify-center pt-10">
        <div className="surface-panel w-full space-y-5 text-center">

          <div className="space-y-2 text-center">
            <h1 className="page-title">
              Om Swami Samarth Agencies
            </h1>
            <p className="text-sm text-[color:var(--text-muted)]">
              Sign in to access your dashboard
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">Secure access to your business dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <label className="block w-full">
              <span className="field-label">Username</span>
              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (error) setError('');
                }}
                className="field-control"
                placeholder="Enter username"
                required
              />
            </label>

            <label className="block w-full">
              <span className="field-label">Password</span>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError('');
                  }}
                  className="field-control w-full pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="h-4.5 w-4.5" /> : <FiEye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--surface-hover)] px-3 py-2 text-sm text-[color:var(--accent-red)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="pt-1 text-center text-xs text-[color:var(--text-muted)]">
            © 2026 Om Swami Samarth Agencies
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
