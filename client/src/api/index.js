import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

// Створюємо axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor для автоматичного додавання токена
apiClient.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.accessToken) {
          config.headers.token = `Bearer ${user.accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обробки відповідей
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен недійсний - очищуємо localStorage
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;