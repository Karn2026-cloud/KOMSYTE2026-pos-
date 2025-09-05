// src/api.js
import axios from 'axios';

// Use environment variable for backend URL, fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: API_URL,
  // Optional: set default headers if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

export default API;
