import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.scss";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      setTimeout(() => {
        setMessage("Інструкції для відновлення паролю надіслано на ваш email");
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError("Помилка відправки. Спробуйте пізніше.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="brand-name">BestFlix</span>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="form-header">
              <h1>Забули пароль?</h1>
              <p>Введіть свою email адресу, і ми надішлемо вам інструкції для відновлення паролю</p>
            </div>

            {message && (
              <div className="success-alert">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="error-alert">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email адреса</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    placeholder="Введіть ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Відправка...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Відправити інструкції
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Згадали пароль? 
                <Link to="/login" className="auth-link">Увійти</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}