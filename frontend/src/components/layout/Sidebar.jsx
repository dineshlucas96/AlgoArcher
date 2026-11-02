import React from 'react';
import { navigate } from '../../app/router.jsx';
import authService from '../../auth/services/authService.js';

function NavIcon({ name }) {
  const icons = {
    overview:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    students:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    faculty:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    courses:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    enrollments: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    import:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    problems:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    analytics:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    settings:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    dashboard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    mycourses:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    submissions: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    reports:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    profile:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    leaderboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 6 2 12 8 18"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
    practice:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    testcases:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
    achievements:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  };
  return icons[name] || null;
}

function SidebarLink({ href, icon, label, active }) {
  return (
    <a
      href={href}
      className={`nav-link${active ? ' active' : ''}`}
      onClick={e => { e.preventDefault(); navigate(href); }}
      aria-current={active ? 'page' : undefined}
    >
      <span className="nav-icon"><NavIcon name={icon} /></span>
      {label}
    </a>
  );
}

const NAV_CONFIG = {
  admin: [
    { href: '/admin',          icon: 'overview',    label: 'Overview'    },
    { href: '/admin/students', icon: 'students',    label: 'Students'    },
    { href: '/admin/faculty',  icon: 'faculty',     label: 'Faculty'     },
    { href: '/admin/courses',  icon: 'courses',     label: 'Courses'     },
    { href: '/admin/import',   icon: 'import',      label: 'Bulk Import' },
    { href: '/admin/analytics',icon: 'analytics',   label: 'Analytics'   },
    { href: '/admin/settings', icon: 'settings',    label: 'Settings'    },
  ],
  faculty: [
    { href: '/faculty',             icon: 'dashboard',   label: 'Dashboard'  },
    { href: '/faculty/courses',     icon: 'mycourses',   label: 'My Courses' },
    { href: '/faculty/students',    icon: 'students',    label: 'Students'   },
    { href: '/faculty/problems',    icon: 'problems',    label: 'Problems'   },
    { href: '/faculty/reports',     icon: 'reports',     label: 'Reports'    },
    { href: '/faculty/submissions', icon: 'submissions', label: 'Submissions'},
    { href: '/faculty/profile',     icon: 'profile',     label: 'Profile'    },
  ],
  student: [
    { href: '/student',              icon: 'dashboard',    label: 'Dashboard'    },
    { href: '/student/courses',      icon: 'mycourses',    label: 'My Courses'   },
    { href: '/student/practice',     icon: 'practice',     label: 'Practice'     },
    { href: '/student/submissions',  icon: 'submissions',  label: 'Submissions'  },
    { href: '/student/achievements', icon: 'achievements', label: 'Achievements' },
    { href: '/student/profile',      icon: 'profile',      label: 'Profile'      },
  ],
};

export default function Sidebar({ role, currentPath, onLogout }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('aa_user') || '{}'); } catch { return {}; } })();
  const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const links = NAV_CONFIG[role] || [];

  return (
    <aside className="sidebar" role="navigation" aria-label={`${role} navigation`}>
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate(authService.homePathForRole(role))}>
        <div className="sidebar-brand-icon">A</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">AlgoArcher</div>
          <div className="sidebar-brand-tagline">NPSB Engineering</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {links.map(link => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href + '/') && link.href !== '/admin' && link.href !== '/faculty' && link.href !== '/student')}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={user.name || user.email}>
              {user.name || user.email || 'User'}
            </div>
            <div className="sidebar-user-role">{role}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

