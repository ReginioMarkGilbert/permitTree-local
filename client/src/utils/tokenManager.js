import * as jwtDecode from 'jwt-decode';

export const setToken = (token) => {
   localStorage.setItem('token', token);
};

export const getToken = () => {
   return localStorage.getItem('token');
};

export const removeToken = () => {
   localStorage.removeItem('token');
};

export const isTokenExpired = (token) => {
   try {
      const decoded = jwtDecode.jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
   } catch (error) {
      return true;
   }
};

export const checkTokenExpiration = (navigate) => {
   const token = getToken();
   if (token && isTokenExpired(token)) {
      removeToken();
      navigate('/auth');
   }
};
