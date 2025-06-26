import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../authContext/apiCalls";
import "./Register.scss";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError("Ім'я обов'язкове");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Прізвище обов'язкове");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Ім'я користувача обов'язкове");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Ім'я користувача повинно містити мінімум 3 символи");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.trim()) {
      setError("Email обов'язковий");
      return false;
    }
    if (!formData.password) {
      setError("Пароль обов'язковий");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Пароль повинен містити мінімум 6 символів");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await register(submitData);
      
      if (response.success) {
        setMessage(response.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || "Помилка реєстрації");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const strengthMap = {
      0: { text: "Дуже слабкий", color: "#ef4444" },
      1: { text: "Слабкий", color: "#f97316" },
      2: { text: "Середній", color: "#eab308" },
      3: { text: "Хороший", color: "#22c55e" },
      4: { text: "Сильний", color: "#16a34a" },
      5: { text: "Дуже сильний", color: "#15803d" }
    };
    
    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              <h1>Створити акаунт</h1>
              <p>Приєднуйтесь до мільйонів користувачів BestFlix</p>
            </div>

            <div className="progress-bar">
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <span>Особисті дані</span>
                </div>
                <div className="progress-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <span>Акаунт</span>
                </div>
              </div>
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
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">Ім'я</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="Ваше ім'я"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Прізвище</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Ваше прізвище"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="username">Ім'я користувача</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Унікальне ім'я користувача"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input-hint">
                      Мінімум 3 символи, тільки літери, цифри та підкреслення
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="submit-btn"
                    onClick={handleNextStep}
                  >
                    Далі
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step">
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
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Пароль</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Створіть надійний пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: passwordStrength.color 
                            }}
                          ></div>
                        </div>
                        <span style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Підтвердіть пароль</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Повторіть пароль"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <div className="input-error">
                        Паролі не співпадають
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="back-btn"
                      onClick={handlePrevStep}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Назад
                    </button>

                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          Реєстрація...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Створити акаунт
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="auth-footer">
              <p>
                Вже маєте акаунт? 
                <Link to="/login" className="auth-link">Увійти</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}