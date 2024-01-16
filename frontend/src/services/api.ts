import axios from 'axios';

const getApiInstance = () => {
  const api = axios.create({
    baseURL: 'http://localhost:3001',
  
  });

  // Add an interceptor to update headers before each request
  api.interceptors.request.use((config) => {
    const updatedAccessToken = localStorage.getItem('accessToken');
    if (updatedAccessToken) {
      config.headers.Authorization = `Bearer ${updatedAccessToken}`;
    }
    return config;
  });

  return api;
};

const api = getApiInstance();

export default api;
