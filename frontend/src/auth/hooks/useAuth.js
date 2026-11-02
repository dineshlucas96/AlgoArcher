/**
 * useAuth — centralized auth state hook
 * All portals use this for user/role/auth status.
 */

import { useState, useCallback } from 'react';
import authService from '../services/authService.js';

export function useAuth() {
  const [user, setUser] = useState(() => authService.getUser());
  const [role, setRole] = useState(() => authService.getRole());

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setRole(data.user.role);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setRole(null);
  }, []);

  const changePassword = useCallback(async (currentPw, newPw) => {
    return authService.changePassword(currentPw, newPw);
  }, []);

  return {
    user,
    role,
    isAuthenticated: !!user && !!authService.getToken(),
    login,
    logout,
    changePassword,
  };
}

export default useAuth;

