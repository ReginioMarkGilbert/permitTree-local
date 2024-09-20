export const getToken = () => {
    const token = localStorage.getItem('token');
    // console.log('Retrieved Token:', token);
    return token;
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return !!getToken();
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

// Add the logout function
export const logout = () => {
    removeToken(); // Remove token from localStorage
    console.log('Token has expired. Logging out...');
    window.location.href = '/auth'; // Redirect to the login page
};

// Add the token expiration check function
export const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const currentTime = Math.floor(Date.now() / 1000);

        return payload.exp < currentTime;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return true;
    }
};
