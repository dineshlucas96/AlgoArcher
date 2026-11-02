/**
 * AlgoArcher SPA Router
 * Preserves existing popstate-based routing pattern.
 * Provides navigate() helper and useRoute() hook.
 */

import { useState, useEffect, useCallback } from 'react';

/** Programmatic navigation — same approach as existing app */
export function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
}

/** Hook: returns current path and a navigate function */
export function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const go = useCallback((to) => navigate(to), []);

  return { path, navigate: go };
}

/**
 * Match a path pattern to extract params.
 * e.g. matchPath('/courses/:cid/problems/:pid', '/courses/3/problems/7')
 *       => { cid: '3', pid: '7' }
 */
export function matchPath(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts    = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Try a list of route patterns in order.
 * Returns { component, params } for the first match.
 */
export function resolveRoute(routes, path) {
  for (const { pattern, component } of routes) {
    if (pattern instanceof RegExp) {
      const m = path.match(pattern);
      if (m) return { component, match: m, params: {} };
    } else {
      const params = matchPath(pattern, path);
      if (params !== null) return { component, params, match: null };
    }
  }
  return null;
}

