/**
 * Authentication utilities for API routes
 */

export function verifyAuth(request, requiredRole = 'admin') {
  try {
    const auth = request.cookies.get('auth');
    const userRole = auth?.value;

    if (!userRole) {
      return { authenticated: false, role: null };
    }

    if (requiredRole && userRole !== requiredRole) {
      return { authenticated: true, role: userRole, authorized: false };
    }

    return { authenticated: true, role: userRole, authorized: true };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, role: null };
  }
}

export function getAuthFromRequest(request) {
  try {
    const auth = request.cookies.get('auth');
    return auth?.value || null;
  } catch (error) {
    return null;
  }
}
