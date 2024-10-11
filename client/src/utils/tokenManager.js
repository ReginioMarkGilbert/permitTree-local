import * as jwtDecode from 'jwt-decode';

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

export const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;

    try {
        const decodedToken = jwtDecode.jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

export const checkTokenExpiration = (navigate) => {
    if (isTokenExpired()) {
        console.log('Token has expired. Logging out...');
        removeToken();
        navigate('/auth');
        return true; // Return true if token has expired
    }
    return false; // Return false if token is still valid
};
