import React from 'react';
import FacultyLayout from '../layouts/FacultyLayout.jsx';
import authService from '../../auth/services/authService.js';
import { useState } from 'react';

export default function FacultyProfile({ path }) {
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
    if (!current || !next) { setError('All fields are required.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
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
    <FacultyLayout currentPath={path} title="Profile" subtitle="Your account and security settings.">
      <div style={{ maxWidth: 540 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--navy)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
            }}>
              {(user.name || 'F').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{user.name || '—'}</div>
              <span className="badge badge-gold" style={{ marginTop: 4 }}>Faculty</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="input" value={current}
                onChange={e => setCurrent(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="input" value={next}
                onChange={e => setNext(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="input" value={confirm}
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
    </FacultyLayout>
  );
}

