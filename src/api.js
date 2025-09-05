// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: "https://komsyte2026-posb23.onrender.com", // hosted backend
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
