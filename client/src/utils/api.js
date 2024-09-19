import axios from 'axios';
import { logout } from './auth';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
            // Unauthorized, token might be expired
            logout();
        }
        return Promise.reject(error);
    }
);

export default api;
