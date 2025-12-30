import axios from 'axios';

const api = axios.create({
    baseURL: 'https://nova-ai-backend-ixnj.onrender.com/api', // Tera Backend URL
    withCredentials: true, // Cookies handle karne ke liye (Sabse Important)
    
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nova_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;