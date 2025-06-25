import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

// Базовий URL для API
const API_BASE_URL = "http://localhost:5000/api";

// Створюємо axios instance з базовою конфігурацією
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor для обробки помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Сервер недоступний. Перевірте підключення.');
    }
    
    if (error.response?.status === 401) {
      // Очищуємо localStorage при 401 помилці
      localStorage.removeItem('user');
    }
    
    throw error;
  }
);

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await apiClient.post("/auth/login", user);
    
    // Перевіряємо чи користувач є адміністратором
    if (res.data && res.data.isAdmin) {
      dispatch(loginSuccess(res.data));
      return res.data;
    } else {
      dispatch(loginFailure());
      throw new Error("Доступ заборонено. Тільки адміністратори можуть увійти в панель.");
    }
  } catch (err) {
    dispatch(loginFailure());
    
    // Обробляємо різні типи помилок
    if (err.response?.status === 401) {
      throw new Error("Неправильний email або пароль");
    } else if (err.response?.status === 403) {
      throw new Error("Доступ заборонено. Потрібні права адміністратора.");
    } else if (err.message) {
      throw err;
    } else {
      throw new Error("Помилка входу. Спробуйте пізніше.");
    }
  }
};