/**
 * Route utilities for building protected routes
 */
import type { ReactElement } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

/**
 * Create a protected route that requires authentication
 * @param path - The route path
 * @param element - The React element/component to render
 * @returns A Route component with auth protection
 */
export function createProtectedRoute(path: string, element: ReactElement) {
  return (
    <Route path={path} element={isAuthenticated() ? element : <Navigate to="/login" replace />} />
  );
}
