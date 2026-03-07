/**
 * Authentication utilities for routes and guards
 */

/**
 * Check if user is authenticated by verifying token and user in localStorage
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('jwtToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('jwtToken');
}

/**
 * Get user data from localStorage
 */
export function getUser(): string | null {
  return localStorage.getItem('user');
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('user');
}
