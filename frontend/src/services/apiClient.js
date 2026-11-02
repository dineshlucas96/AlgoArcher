/**
 * AlgoArcher API Client
 * Centralized fetch wrapper — preserves existing token/auth logic.
 * All portals must use this client.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010';

/** Get auth headers from localStorage (exact same keys as existing app) */
function getAuthHeaders() {
  const token = localStorage.getItem('aa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Core API fetch wrapper.
 * Throws an error with .status on non-OK responses.
 */
async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  // Don't set Content-Type for FormData (let browser set multipart boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.detail || data.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Download a file (streaming response) with auth headers.
 * Returns a Blob and the filename from Content-Disposition.
 */
async function apiDownload(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.detail || 'Download failed');
    err.status = response.status;
    throw err;
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename=([^;]+)/);
  const filename = match ? match[1].replace(/['"]/g, '') : 'download';

  return { blob, filename };
}

/** Trigger a file download in the browser */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const apiClient = {
  get: (path, options = {}) =>
    apiRequest(path, { method: 'GET', ...options }),

  post: (path, body, options = {}) =>
    apiRequest(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (path, body, options = {}) =>
    apiRequest(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (path, options = {}) =>
    apiRequest(path, { method: 'DELETE', ...options }),

  download: apiDownload,

  /** Raw API base URL for cases that need it (e.g., template links) */
  baseUrl: API_BASE,
};

export default apiClient;

