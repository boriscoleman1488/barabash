import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", user);
    
    if (res.data.success) {
      dispatch(loginSuccess(res.data));
      return res.data;
    } else {
      dispatch(loginFailure());
      throw new Error(res.data.message || "Помилка входу");
    }
  } catch (err) {
    dispatch(loginFailure());
    throw err;
  }
};