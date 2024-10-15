import { isTokenExpired, removeToken } from './tokenManager';
import * as jwtDecode from 'jwt-decode'; // Import everything as jwtDecode

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => {
   const token = getToken();
   return token && !isTokenExpired(token);
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
   removeToken();
   console.log('Token has expired. Logging out...');
   window.location.href = '/auth';
};
