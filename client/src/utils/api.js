import axios from 'axios';
import { getToken, isTokenExpired, removeToken } from './tokenManager';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (isTokenExpired()) {
                removeToken();
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
