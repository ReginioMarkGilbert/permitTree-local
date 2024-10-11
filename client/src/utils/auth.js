import { getToken, isTokenExpired, removeToken } from './tokenManager';

export const isAuthenticated = () => {
  const token = getToken();
  return token && !isTokenExpired();
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.role;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const logout = () => {
  removeToken(); // Remove token from localStorage
  console.log('Token has expired. Logging out...');
  window.location.href = '/auth'; // Redirect to the login page
};

// Re-export getToken from tokenManager
export { getToken };
