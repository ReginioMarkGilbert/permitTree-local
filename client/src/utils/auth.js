export const getToken = () => {
    const token = localStorage.getItem('token');
    // console.log('Retrieved Token:', token);
    return token;
};

export const setToken = (token) => {
    // console.log('Setting Token:', token);
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
        // console.log('Token Payload:', payload);
        return payload.role;
    } catch (error) {   3
        console.error('Failed to decode token:', error);
        return null;
    }
};
