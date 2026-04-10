import { useState } from 'react';
import { updateAccount } from '../services/api.js';

function Settings({ onAccountUpdated }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = Boolean(currentPassword && (newUsername.trim() || newPassword) && !saving);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        currentPassword,
        ...(newUsername.trim() ? { newUsername: newUsername.trim() } : {}),
        ...(newPassword ? { newPassword } : {})
      };

      const response = await updateAccount(payload);
      const token = response?.token;

      if (token) {
        localStorage.setItem('authToken', token);
        onAccountUpdated?.(token);
      }

      setSuccess(response?.message || 'Account updated successfully');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
    } catch (updateError) {
      setError(updateError.message || 'Unable to update account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">Update your username or password.</p>
      </div>

      <form onSubmit={handleSubmit} className="surface-panel space-y-5">
        <label className="block">
          <span className="field-label">Current Password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="field-control"
            required
          />
        </label>

        <label className="block">
          <span className="field-label">New Username</span>
          <input
            type="text"
            value={newUsername}
            onChange={(event) => setNewUsername(event.target.value)}
            className="field-control"
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="field-label">New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="field-control"
            placeholder="Optional"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/10 px-3 py-2 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-[color:var(--accent-green)] bg-[color:var(--accent-green)]/10 px-3 py-2 text-sm text-[color:var(--accent-green)]">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default Settings;