import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../authContext/apiCalls';
import './ResetPassword.scss';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Недійсний токен відновлення паролю');
    }
  }, [token]);

  const validateForm = () => {
    if (!password) {
      setError('Пароль є обов\'язковим');
      return false;
    }
    if (password.length < 8) {
      setError('Пароль повинен містити мінімум 8 символів');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Помилка скидання паролю');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="reset-password">
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
        <div className="reset-card">
          {!isSuccess ? (
            <>
              <h1>Новий пароль</h1>
              <p>Введіть новий пароль для вашого акаунту.</p>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="input-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Новий пароль (мінімум 8 символів)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                
                <div className="input-group password-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Підтвердіть новий пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isLoading}
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
                  className="submit-button"
                  disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                >
                  {isLoading ? "Збереження..." : "Зберегти новий пароль"}
                </button>
              </form>
              
              <div className="back-to-login">
                <Link to="/login">← Повернутися до входу</Link>
              </div>
            </>
          ) : (
            <>
              <div className="success-icon">✅</div>
              <h1>Пароль оновлено!</h1>
              <p>{successMessage}</p>
              <p>Ви будете автоматично перенаправлені на сторінку входу через кілька секунд.</p>
              
              <div className="actions">
                <Link to="/login">
                  <button className="login-button">Увійти зараз</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}