import React, { useState, useRef } from 'react';
import { navigate } from '../../app/router.jsx';
import authService from '../services/authService.js';
import '../../../src/styles/auth.css';

/** Accessible SVG Icons for Roles */
function StudentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

function FacultyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

/** Show/Hide password toggle button */
function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="password-toggle-btn"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      tabIndex={0}
    >
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    heading: 'Student Login',
    description: 'Access your coding workspace, practice problems, and track your progress.',
    buttonText: 'Sign in as Student',
    icon: <StudentIcon />,
    sampleEmail: 'alice@college.edu',
    samplePw: 'S001',
    hintLabel: 'Student Demo Account',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    heading: 'Faculty Login',
    description: 'Review student performance, manage courses, and download reports.',
    buttonText: 'Sign in as Faculty',
    icon: <FacultyIcon />,
    sampleEmail: 'faculty1@college.edu',
    samplePw: 'F001',
    hintLabel: 'Faculty Demo Account',
  },
  {
    id: 'admin',
    label: 'Admin',
    heading: 'Admin Login',
    description: 'Oversee department analytics, manage users, and perform bulk imports.',
    buttonText: 'Sign in as Admin',
    icon: <AdminIcon />,
    sampleEmail: 'admin@college.edu',
    samplePw: 'Admin@123',
    hintLabel: 'Admin Demo Account',
  },
];

export default function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const tabRefs = useRef([]);

  const currentRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  function handleRoleChange(roleId) {
    setSelectedRole(roleId);
    setError('');
  }

  function handleKeyDown(e, index) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % ROLES.length;
      handleRoleChange(ROLES[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + ROLES.length) % ROLES.length;
      handleRoleChange(ROLES[prevIndex].id);
      tabRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleRoleChange(ROLES[0].id);
      tabRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = ROLES.length - 1;
      handleRoleChange(ROLES[lastIndex].id);
      tabRefs.current[lastIndex]?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError('Email is required.'); return; }
    if (!password)   { setError('Password is required.'); return; }

    setLoading(true);
    setError('');

    try {
      const data = await authService.login(cleanEmail, password);
      const actualRole = data?.user?.role;

      // Verify that actual role matches the selected portal
      if (actualRole !== selectedRole) {
        // Discard session and credentials from localStorage
        authService.logout();

        const roleLabels = {
          student: 'Student',
          faculty: 'Faculty',
          admin: 'Admin',
        };
        const actualName = roleLabels[actualRole] || actualRole;
        const selectedName = roleLabels[selectedRole] || selectedRole;

        setError(
          `Access denied: This account has the "${actualName}" role and cannot sign in through the ${selectedName} portal. Please select the ${actualName} tab.`
        );
        return;
      }

      if (onLoginSuccess) onLoginSuccess(data.user);

      if (data.user.must_change_pw) {
        navigate('/change-password');
      } else {
        navigate(authService.homePathForRole(data.user.role));
      }
    } catch (err) {
      if (err.status === 401 || err.message?.includes('Invalid email or password')) {
        setError(
          `Invalid email or password for ${currentRoleConfig.label}. (Try ${currentRoleConfig.sampleEmail} / ${currentRoleConfig.samplePw})`
        );
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* ── LEFT: Branding Panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          {/* College Emblem placeholder */}
          <div className="auth-college-emblem" aria-hidden="true">
            🏛️
          </div>

          {/* Product name */}
          <div className="auth-logo-mark">
            <div className="auth-logo-icon">A</div>
            <span className="auth-product-name">
              Algo<span>Archer</span>
            </span>
          </div>

          <p className="auth-college-name">
            New Prince Shri Bhavani College of<br />Engineering and Technology
          </p>

          <div className="auth-gold-divider" />

          <p className="auth-tagline">
            "Your Journey from Learning<br />to Problem Solving."
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              Multi-role portal — Student, Faculty, Admin
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              Real-time code execution &amp; judging
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              Course leaderboards &amp; progress tracking
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              Faculty analytics &amp; Excel reports
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Role Selector Segmented Control */}
          <div
            className="auth-role-tabs"
            role="tablist"
            aria-label="Select login portal"
          >
            {ROLES.map((r, index) => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  ref={el => (tabRefs.current[index] = el)}
                  type="button"
                  role="tab"
                  id={`role-tab-${r.id}`}
                  aria-selected={isSelected}
                  aria-controls="login-form"
                  tabIndex={isSelected ? 0 : -1}
                  className={`auth-role-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => handleRoleChange(r.id)}
                  onKeyDown={e => handleKeyDown(e, index)}
                >
                  <span className="auth-role-icon">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Header */}
          <div className="auth-form-header">
            <h2>{currentRoleConfig.heading}</h2>
            <p>{currentRoleConfig.description}</p>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="auth-demo-hint">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {currentRoleConfig.hintLabel}
                </span>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  <strong>{currentRoleConfig.sampleEmail}</strong> · {currentRoleConfig.samplePw}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', height: 'auto', borderRadius: '6px' }}
                onClick={() => {
                  setEmail(currentRoleConfig.sampleEmail);
                  setPassword(currentRoleConfig.samplePw);
                  setError('');
                }}
              >
                Auto-fill
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            id="login-form"
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby={`role-tab-${selectedRole}`}
          >
            {/* Email */}
            <div className="auth-form-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder={currentRoleConfig.sampleEmail}
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="auth-form-field">
              <label htmlFor="login-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <PasswordToggle
                  visible={showPw}
                  onToggle={() => setShowPw(v => !v)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Dynamic Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <span>{currentRoleConfig.buttonText}</span>
              )}
            </button>
          </form>

          <p className="auth-copyright">
            © 2026 AlgoArcher · New Prince Shri Bhavani College of Engineering and Technology
          </p>
        </div>
      </div>
    </div>
  );
}
