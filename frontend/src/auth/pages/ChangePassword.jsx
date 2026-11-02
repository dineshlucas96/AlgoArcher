import React, { useState } from 'react';
import { navigate } from '../../app/router.jsx';
import authService from '../services/authService.js';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!current) { setError('Current password is required.'); return; }
    if (!next)    { setError('New password is required.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await authService.changePassword(current, next);
      setSuccess(true);
      setTimeout(() => {
        const role = authService.getRole();
        navigate(authService.homePathForRole(role));
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="change-pw-shell">
      <div className="change-pw-card">
        <div className="change-pw-header">
          <div className="change-pw-icon">🔐</div>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
              Change Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, marginTop: 4 }}>
              You must set a new password before continuing.
            </p>
          </div>
        </div>

        {success ? (
          <div className="alert alert-success">
            ✓ Password changed successfully. Redirecting…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cp-current">Current Password</label>
              <input id="cp-current" type="password" className="input" value={current}
                onChange={e => setCurrent(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cp-new">New Password</label>
              <input id="cp-new" type="password" className="input" value={next}
                onChange={e => setNext(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cp-confirm">Confirm New Password</label>
              <input id="cp-confirm" type="password" className="input" value={confirm}
                onChange={e => setConfirm(e.target.value)} disabled={loading} />
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ padding: '12px', fontSize: '1rem', marginTop: 8 }}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

