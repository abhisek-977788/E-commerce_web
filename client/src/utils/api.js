import axios from 'axios';

const productionApiUrl = 'https://wistoria-qq9f.onrender.com/api';
const legacyProductionApiUrl = 'https://wistoria-api.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

const apiBaseUrl = (
  import.meta.env.PROD && (!configuredApiUrl || configuredApiUrl === legacyProductionApiUrl)
    ? productionApiUrl
    : configuredApiUrl || (import.meta.env.PROD ? productionApiUrl : 'http://localhost:5000/api')
).replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('wistoria:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
