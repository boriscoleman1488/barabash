import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../authContext/apiCalls';
import './VerifyEmail.scss';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Недійсний токен підтвердження');
        return;
      }

      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Помилка підтвердження email');
      }
    };

    handleVerification();
  }, [token]);

  return (
    <div className="verify-email">
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
        <div className="verification-card">
          {status === 'loading' && (
            <>
              <div className="loading-spinner"></div>
              <h1>Підтвердження email...</h1>
              <p>Будь ласка, зачекайте</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="success-icon">✅</div>
              <h1>Email підтверджено!</h1>
              <p>{message}</p>
              <div className="actions">
                <Link to="/login">
                  <button className="login-button">Увійти в акаунт</button>
                </Link>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="error-icon">❌</div>
              <h1>Помилка підтвердження</h1>
              <p>{message}</p>
              <div className="actions">
                <Link to="/register">
                  <button className="register-button">Зареєструватися знову</button>
                </Link>
                <Link to="/login">
                  <button className="login-button secondary">Увійти</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}