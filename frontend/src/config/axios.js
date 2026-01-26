import axios from 'axios';

// La URL base de la API se obtiene de la variable de entorno
// En Railway, esto será la URL del servicio backend
// En desarrollo local, será '/api' (proxy)
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🚀 Axios Config - API URL:', API_URL);

// Instancia de axios configurada con la URL base
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para logging (solo en desarrollo)
if (import.meta.env.DEV) {
    axiosInstance.interceptors.request.use(
        (config) => {
            console.log(`📡 [${config.method.toUpperCase()}] ${config.baseURL}${config.url}`);
            return config;
        },
        (error) => {
            console.error('❌ Request error:', error);
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => {
            console.log(`✅ [${response.config.method.toUpperCase()}] ${response.config.url} - ${response.status}`);
            return response;
        },
        (error) => {
            console.error('❌ Response error:', error.response?.status, error.message);
            return Promise.reject(error);
        }
    );
}

export default axiosInstance;
