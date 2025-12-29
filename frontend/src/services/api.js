import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Tera Backend URL
    withCredentials: true, // Cookies handle karne ke liye (Sabse Important)
});

export default api;