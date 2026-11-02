import React from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import PortalHeader from '../../components/layout/Header.jsx';
import authService from '../../auth/services/authService.js';
import { navigate } from '../../app/router.jsx';

export default function AdminLayout({ currentPath, title, subtitle, headerActions, children }) {
  function handleLogout() {
    authService.logout();
    navigate('/login');
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <Sidebar role="admin" currentPath={currentPath} onLogout={handleLogout} />
      <div className="main-content">
        <PortalHeader role="admin" title={title} subtitle={subtitle} actions={headerActions} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

