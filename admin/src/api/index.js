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
    const adminUser = JSON.parse(localStorage.getItem("admin_user") || '{}');
    if (adminUser.accessToken) {
      config.headers.token = `Bearer ${adminUser.accessToken}`;
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
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;