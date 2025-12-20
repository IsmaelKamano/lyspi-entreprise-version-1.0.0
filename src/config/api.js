// src/config/api.js
const RAW = import.meta.env.VITE_API_URL || 'https://backend-entreprise.onrender.com';
const API = RAW.endsWith('/api') ? RAW : RAW.replace(/\/$/, '') + '/api';
const API_BASE_URL = RAW.replace(/\/api\/?$/, '').replace(/\/$/, '');
const SOCKET = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export { API_BASE_URL, API, SOCKET };
