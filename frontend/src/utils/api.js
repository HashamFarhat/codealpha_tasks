import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
});

// Interceptor to inject jwt from localStorage
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
