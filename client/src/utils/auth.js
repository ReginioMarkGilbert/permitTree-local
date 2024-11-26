import { isTokenExpired, removeToken } from './tokenManager';
import * as jwtDecode from 'jwt-decode'; // Import everything as jwtDecode

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => {
   const token = getToken();
   return token && !isTokenExpired(token);
};

export const getUserId = () => {
   const user = JSON.parse(localStorage.getItem('user'));
   return user ? user.id : null;
};

export const getAdminId = () => {
   const admin = JSON.parse(localStorage.getItem('admin'));
   return admin ? admin.id : null;
};

// export const getUserRole = () => {
//    const token = getToken();
//    if (!token) return null;
//    try {
//       const decoded = jwtDecode(token); // Use it as a function
//       return decoded.role;
//    } catch (error) {
//       console.error('Failed to decode token:', error);
//       return null;
//    }
// };

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
   // Clear all auth-related data
   removeToken();
   localStorage.removeItem('user');

   // Reset theme to system default
   document.documentElement.classList.remove('dark');
   localStorage.removeItem('theme');

   // Redirect to auth page
   console.log('Logging out...');
   window.location.href = '/auth';
};

export const getUserRoles = () => {
   const user = JSON.parse(localStorage.getItem('user'));
   return user ? user.roles : [];
};
