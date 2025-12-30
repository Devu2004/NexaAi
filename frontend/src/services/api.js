import axios from 'axios';

const api = axios.create({
    baseURL: 'https://nova-ai-backend-ixnj.onrender.com/api', // Tera Backend URL
    withCredentials: true, // Cookies handle karne ke liye (Sabse Important)
});

export default api;