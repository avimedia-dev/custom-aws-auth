import axios from 'axios';

// Use Vite environment variable (falls back to local dev URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/dev';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API endpoints
export const register = (email, password) =>
  api.post('/register', { email, password });

export const login = (email, password) =>
  api.post('/login', { email, password });

export const getProfile = () => api.get('/profile');