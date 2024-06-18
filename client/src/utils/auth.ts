
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
};
