import "./Login.scss";
import { useContext, useState, useEffect } from "react";
import { login, clearError } from "../../authContext/apiCalls";
import { AuthContext } from "../../authContext/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { isFetching, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError(dispatch);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    const result = await login({ email, password, rememberMe }, dispatch);
    
    if (result.success) {
      navigate("/");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="BestFlix"
          />
        </div>
      </div>
      <div className="container">
        <form onSubmit={handleLogin}>
          <h1>Вхід</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="input-group">
            <input
              type="email"
              placeholder="Email адреса"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFetching}
              required
            />
          </div>
          
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFetching}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isFetching}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isFetching}
              />
              <span className="checkmark"></span>
              Запам'ятати мене
            </label>
            
            <Link to="/forgot-password" className="forgot-link">
              Забули пароль?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="loginButton"
            disabled={isFetching || !email || !password}
          >
            {isFetching ? "Вхід..." : "Увійти"}
          </button>
          
          <span>
            Новий користувач? <Link to="/register"><b>Зареєструватися</b></Link>
          </span>
          
          <small>
            Ця сторінка захищена Google reCAPTCHA для забезпечення безпеки.
          </small>
        </form>
      </div>
    </div>
  );
}