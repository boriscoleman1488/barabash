import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError } from '../../authContext/apiCalls';
import { AuthContext } from '../../authContext/AuthContext';
import './ForgotPassword.scss';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { isFetching, error, dispatch } = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError(dispatch);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccessMessage(result.message);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="forgot-password">
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
        <div className="forgot-card">
          {!isSubmitted ? (
            <>
              <h1>Відновлення паролю</h1>
              <p>Введіть свій email адрес і ми надішлемо вам інструкції для відновлення паролю.</p>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
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
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isFetching || !email}
                >
                  {isFetching ? "Відправлення..." : "Відправити інструкції"}
                </button>
              </form>
              
              <div className="back-to-login">
                <Link to="/login">← Повернутися до входу</Link>
              </div>
            </>
          ) : (
            <>
              <div className="success-icon">📧</div>
              <h1>Інструкції відправлено!</h1>
              <p>{successMessage}</p>
              <p>Перевірте свою поштову скриньку та перейдіть за посиланням для відновлення паролю.</p>
              
              <div className="actions">
                <Link to="/login">
                  <button className="login-button">Повернутися до входу</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}