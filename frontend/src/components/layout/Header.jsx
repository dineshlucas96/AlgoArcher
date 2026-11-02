import React from 'react';

export default function PortalHeader({ role, title, subtitle, actions }) {
  const roleBadgeClass =
    role === 'admin' ? 'role-badge-admin' :
    role === 'faculty' ? 'role-badge-faculty' : 'role-badge-student';

  const roleLabel =
    role === 'admin' ? 'Admin Portal' :
    role === 'faculty' ? 'Faculty Portal' : 'Student Portal';

  return (
    <header className="portal-header">
      <div className="portal-header-left">
        <div>
          {title && (
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--navy)', margin: 0, lineHeight: 1.3 }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="portal-header-right">
        {actions}
        <span className={`portal-role-badge ${roleBadgeClass}`}>{roleLabel}</span>
      </div>
    </header>
  );
}

