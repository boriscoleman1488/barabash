import "./Login.scss";
import { useContext, useState } from "react";
import { login } from "../../authContext/apiCalls";
import { AuthContext } from "../../authContext/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  
  const { dispatch, isFetching } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(formData, dispatch);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || "Помилка входу";
      setError(errorMessage);
    }
  };

  return (
    <div className="login">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix"
          />
        </div>
      </div>
      
      <div className="container">
        <div className="formContainer">
          <h1>Увійти</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="loginForm">
            <input
              type="email"
              name="email"
              placeholder="Email або номер телефону"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button 
              type="submit" 
              className="loginButton"
              disabled={isFetching}
            >
              {isFetching ? "Вхід..." : "Увійти"}
            </button>
          </form>

          <div className="formHelp">
            <div className="rememberMe">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Запам'ятати мене</label>
            </div>
          </div>

          <div className="signupLink">
            Вперше на Netflix? <Link to="/register">Зареєструйтеся зараз</Link>
          </div>

          <div className="captchaText">
            Ця сторінка захищена Google reCAPTCHA, щоб переконатися, що ви не бот.{" "}
            <a href="#" className="learnMore">Дізнатися більше</a>.
          </div>
        </div>
      </div>
    </div>
  );
}