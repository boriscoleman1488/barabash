import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Налаштування axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor для додавання токену до запитів
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
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
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Функція входу
export const login = async (userCredentials, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await api.post("/auth/login", userCredentials);
    
    if (res.data.success !== false) {
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      return { success: true, data: res.data };
    } else {
      const errorMessage = res.data.message || "Помилка входу";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Помилка входу";
    dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Функція реєстрації
export const register = async (userData, dispatch) => {
  dispatch({ type: "REGISTER_START" });
  try {
    const res = await api.post("/auth/register", userData);
    
    if (res.data.success !== false) {
      dispatch({ type: "REGISTER_SUCCESS" });
      return { 
        success: true, 
        message: res.data.message || "Реєстрація успішна. Перевірте email для підтвердження." 
      };
    } else {
      const errorMessage = res.data.message || "Помилка реєстрації";
      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Помилка реєстрації";
    dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Функція підтвердження email
export const verifyEmail = async (token) => {
  try {
    const res = await api.get(`/auth/verify-email/${token}`);
    return { success: true, message: res.data.message };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || "Помилка підтвердження email" 
    };
  }
};

// Функція повторного відправлення email підтвердження
export const resendVerificationEmail = async (email) => {
  try {
    const res = await api.post("/auth/resend-verification", { email });
    return { success: true, message: res.data.message };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || "Помилка відправлення email" 
    };
  }
};

// Функція відновлення паролю
export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return { success: true, message: res.data.message };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || "Помилка відновлення паролю" 
    };
  }
};

// Функція скидання паролю
export const resetPassword = async (token, password) => {
  try {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return { success: true, message: res.data.message };
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || "Помилка скидання паролю" 
    };
  }
};

// Функція виходу
export const logout = (dispatch) => {
  localStorage.removeItem("user");
  dispatch({ type: "LOGOUT" });
};

// Функція очищення помилок
export const clearError = (dispatch) => {
  dispatch({ type: "CLEAR_ERROR" });
};

// Функція оновлення профілю користувача
export const updateProfile = async (userId, userData, dispatch) => {
  try {
    const res = await api.put(`/users/${userId}`, userData);
    
    if (res.data.success) {
      dispatch({ type: "UPDATE_USER", payload: res.data.user });
      return { success: true, message: "Профіль оновлено успішно" };
    } else {
      return { success: false, error: res.data.message };
    }
  } catch (err) {
    return { 
      success: false, 
      error: err.response?.data?.message || "Помилка оновлення профілю" 
    };
  }
};

export { api };
export default api;