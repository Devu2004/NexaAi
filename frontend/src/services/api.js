import axios from 'axios';

const api = axios.create({
    baseURL: 'https://nova-ai-backend-ixnj.onrender.com/api', 
    withCredentials: true, // Cookies ke liye zaroori hai
});

// REQUEST INTERCEPTOR: Har request ke sath token bhejne ke liye
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nova_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Agar token expire ho jaye to auto-logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token invalid hai ya expire ho chuka hai
            localStorage.removeItem('nova_auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;