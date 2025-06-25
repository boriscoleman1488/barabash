import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Налаштування axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor для додавання токену до запитів
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('admin_user'));
    if (user && user.accessToken) {
      config.headers.token = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обробки відповідей
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Функція входу
export const loginCall = async (userCredentials, dispatch) => {
  dispatch({ type: 'LOGIN_START' });
  try {
    const res = await api.post('/auth/login', userCredentials);
    
    if (res.data.isAdmin) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return { success: true };
    } else {
      const errorMessage = 'Доступ заборонено. Тільки для адміністраторів.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Помилка входу';
    dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Функція виходу
export const logoutCall = (dispatch) => {
  localStorage.removeItem('admin_user');
  dispatch({ type: 'LOGOUT' });
};

// Функція очищення помилок
export const clearError = (dispatch) => {
  dispatch({ type: 'CLEAR_ERROR' });
};

export { api };
export default api;