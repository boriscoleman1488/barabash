import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await apiClient.post("/auth/login", user);
    
    // Перевіряємо чи користувач є адміністратором
    if (res.data.isAdmin) {
      dispatch(loginSuccess(res.data));
      return res.data;
    } else {
      dispatch(loginFailure());
      throw new Error("Доступ заборонено. Тільки адміністратори можуть увійти в панель.");
    }
  } catch (err) {
    dispatch(loginFailure());
    throw err;
  }
};