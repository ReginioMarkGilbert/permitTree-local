export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved Token:', token); // Debugging line
    return token;
};

export const setToken = (token) => {
    console.log('Setting Token:', token); // Debugging line
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
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token Payload:', payload); // Debugging line
        return payload.role; // Ensure this matches the key used in the JWT payload
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};
