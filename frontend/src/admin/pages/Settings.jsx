import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import authService from '../../auth/services/authService.js';

export default function AdminSettings({ path }) {
  const user = authService.getUser() || {};
  const [current, setCurrent] = useState('');
  const [next, setNext]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleChangePw(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!current) { setError('Current password is required.'); return; }
    if (!next)    { setError('New password is required.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await authService.changePassword(current, next);
      setSuccess('Password changed successfully.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout currentPath={path} title="Settings" subtitle="Account and security settings.">
      <div style={{ maxWidth: 540 }}>
        {/* Profile card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--navy)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
            }}>
              {(user.name || user.email || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{user.name || '—'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="s-current">Current Password</label>
              <input id="s-current" type="password" className="input" value={current}
                onChange={e => setCurrent(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-new">New Password</label>
              <input id="s-new" type="password" className="input" value={next}
                onChange={e => setNext(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="s-confirm">Confirm New Password</label>
              <input id="s-confirm" type="password" className="input" value={confirm}
                onChange={e => setConfirm(e.target.value)} disabled={loading} />
            </div>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

