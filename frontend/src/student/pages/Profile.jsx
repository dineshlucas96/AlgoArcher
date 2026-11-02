import React, { useState } from 'react';
import StudentLayout from '../layouts/StudentLayout.jsx';
import authService from '../../auth/services/authService.js';

export default function StudentProfile({ path }) {
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
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    if (next.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await authService.changePassword(current, next);
      setSuccess('Password updated successfully.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StudentLayout
      currentPath={path}
      title="Student Profile"
      subtitle="Account details and security settings."
    >
      <div style={{ maxWidth: 560 }}>
        {/* User Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Student Details</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--navy)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
            }}>
              {(user.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--navy)' }}>{user.name || 'Student'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Student Portal</div>
              <span className="badge badge-blue" style={{ marginTop: 6 }}>Enrolled Student</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Account ID
              </span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                #{user.id || '—'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Institution
              </span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, fontSize: '0.8125rem' }}>
                NPSB Engineering College
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Security · Change Password</h3>
          <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter current password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter new password"
                value={next}
                onChange={e => setNext(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={loading}
              />
            </div>

            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}

