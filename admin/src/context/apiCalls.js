import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginCall = async (userCredentials, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post(`${API_URL}/login`, userCredentials);
    
    if (res.data.isAdmin) {
      localStorage.setItem("user", JSON.stringify(res.data));
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } else {
      dispatch({ type: "LOGIN_FAILURE", payload: "Доступ заборонено. Тільки для адміністраторів." });
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Помилка входу";
    dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
  }
};

export const login = loginCall; // Для сумісності з існуючим кодом

export const logoutCall = (dispatch) => {
  localStorage.removeItem("user");
  dispatch({ type: "LOGOUT" });
};