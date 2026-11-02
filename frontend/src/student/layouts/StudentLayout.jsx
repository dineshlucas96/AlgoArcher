import React from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import PortalHeader from '../../components/layout/Header.jsx';
import authService from '../../auth/services/authService.js';
import { navigate } from '../../app/router.jsx';

export default function StudentLayout({ currentPath, title, subtitle, headerActions, fullHeight, children }) {
  function handleLogout() {
    authService.logout();
    navigate('/login');
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" currentPath={currentPath} onLogout={handleLogout} />
      <div className="main-content">
        <PortalHeader role="student" title={title} subtitle={subtitle} actions={headerActions} />
        <main className={fullHeight ? '' : 'page-content'}>
          {children}
        </main>
      </div>
    </div>
  );
}

