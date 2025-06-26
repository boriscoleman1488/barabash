import { loginStart, loginSuccess, loginFailure } from "./AuthActions";
import apiClient from "../../api";

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await apiClient.post("/auth/login", user);
    
    if (res.data.isAdmin) {
      // Зберігаємо користувача в localStorage
      localStorage.setItem("admin_user", JSON.stringify(res.data));
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
