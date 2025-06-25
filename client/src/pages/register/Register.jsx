import { useRef, useEffect, useState } from "react";
import "./Register.scss";
import { register, clearError } from "../../authContext/apiCalls";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../authContext/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const emailRef = useRef();
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

  const handleStart = () => {
    const emailValue = emailRef.current.value;
    if (emailValue && isValidEmail(emailValue)) {
      setEmail(emailValue);
      setStep(2);
    }
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      email,
      password,
      username,
      firstName,
      lastName,
    };

    const result = await register(userData, dispatch);
    
    if (result.success) {
      setSuccessMessage(result.message);
      setStep(3);
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      return false;
    }
    if (!firstName.trim()) {
      return false;
    }
    if (!lastName.trim()) {
      return false;
    }
    if (password.length < 8) {
      return false;
    }
    if (password !== confirmPassword) {
      return false;
    }
    return true;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="BestFlix"
          />
          <Link to="/login">
            <button className="loginButton">Увійти</button>
          </Link>
        </div>
      </div>

      <div className="container">
        {step === 1 && (
          <>
            <h1>Необмежені фільми, серіали та багато іншого.</h1>
            <h2>Дивіться де завгодно. Скасуйте в будь-який час.</h2>
            <p>
              Готові дивитися? Введіть свій email, щоб створити або відновити членство.
            </p>
            <div className="input">
              <input 
                type="email" 
                placeholder="Email адреса" 
                ref={emailRef}
                required
              />
              <button className="registerButton" onClick={handleStart}>
                Розпочати
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="form-container">
            <h1>Створити акаунт</h1>
            <p>Заповніть форму для завершення реєстрації</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form className="register-form" onSubmit={handleFinish}>
              <div className="input-row">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Ім'я"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isFetching}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Прізвище"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isFetching}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ім'я користувача"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isFetching}
                  required
                />
              </div>
              
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
                  placeholder="Пароль (мінімум 8 символів)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isFetching}
                  required
                  minLength={8}
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
              
              <div className="input-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Підтвердіть пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isFetching}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isFetching}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {password && confirmPassword && password !== confirmPassword && (
                <div className="password-mismatch">
                  Паролі не співпадають
                </div>
              )}
              
              <button 
                type="submit" 
                className="registerButton"
                disabled={isFetching || !validateForm()}
              >
                {isFetching ? "Реєстрація..." : "Створити акаунт"}
              </button>
            </form>
            
            <div className="login-link">
              Вже маєте акаунт? <Link to="/login"><b>Увійти</b></Link>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h1>Реєстрація успішна!</h1>
            <p>{successMessage}</p>
            <div className="success-actions">
              <Link to="/login">
                <button className="loginButton">Увійти в акаунт</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}