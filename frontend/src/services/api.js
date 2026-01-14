import axios from 'axios';

// Since we are proxying or serving from same origin in production, we can use relative path
// But in dev mode (Vite typically runs on 5173), we definitely need a proxy in vite.config.js to localhost:8000
const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setupInterceptors = (addToast) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const message = error.response?.data?.detail || error.message || "An unexpected error occurred";
            const status = error.response?.status;

            if (status === 500) {
                addToast(`Server Error: ${message}`, 'error');
            } else if (status === 404) {
                addToast(`Resource not found: ${message}`, 'error');
            } else if (status === 422) {
                addToast(`Validation Error: ${message}`, 'error');
            } else if (!status) {
                addToast(`Network Error: ${message}`, 'error');
            }

            return Promise.reject(error);
        }
    );
};

export default api;
