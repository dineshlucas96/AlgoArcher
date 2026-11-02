/**
 * Auth Service — wraps /auth/* endpoints
 * Preserves exact existing token/user storage keys (aa_token, aa_role, aa_user)
 */

import apiClient from '../../services/apiClient.js';

const TOKEN_KEY = 'aa_token';
const ROLE_KEY  = 'aa_role';
const USER_KEY  = 'aa_user';

export const authService = {
  /**
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   * @returns {{ access_token, user: { id, name, role, must_change_pw } }}
   */
  async login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password });
    // Store exactly as the existing app does
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(ROLE_KEY,  data.user.role);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
    return data;
  },

  /**
   * POST /auth/change-password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /** Clear all auth state and redirect to login */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Get the current user object from storage */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  getRole() {
    return localStorage.getItem(ROLE_KEY) || null;
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /** Return home path for a given role */
  homePathForRole(role) {
    if (role === 'admin')   return '/admin';
    if (role === 'faculty') return '/faculty';
    return '/student';
  },
};

export default authService;

