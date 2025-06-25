import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../context/apiCalls';
import './adminLogin.css';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Security,
  Dashboard,
  MovieFilter,
  AdminPanelSettings
} from '@material-ui/icons';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { isFetching, error, dispatch } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email є обов\'язковим полем';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Введіть коректний email';
    }
    
    if (!password) {
      newErrors.password = 'Пароль є обов\'язковим полем';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      
      try {
        await login({ email, password, rememberMe }, dispatch);
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Помилка входу. Спробуйте ще раз.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else if (field === 'password') {
      setPassword(value);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
    
    // Очищаємо загальну помилку при зміні будь-якого поля
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const adminFeatures = [
    {
      icon: <MovieFilter />,
      title: 'Управління контентом',
      description: 'Додавайте, редагуйте та модеруйте фільми, серіали та інший відеоконтент'
    },
    {
      icon: <Dashboard />,
      title: 'Аналітика та звіти',
      description: 'Відстежуйте статистику переглядів, доходи та активність користувачів'
    },
    {
      icon: <Security />,
      title: 'Безпека системи',
      description: 'Контролюйте доступ, налаштування безпеки та резервне копіювання'
    }
  ];

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        {/* Ліва частина з інформацією */}
        <div className="admin-login-info">
          <div className="admin-brand">
            <div className="brand-icon-wrapper">
              <AdminPanelSettings className="brand-icon" />
            </div>
            <h1>BestFlix Admin</h1>
            <p className="brand-subtitle">Панель адміністратора</p>
          </div>
          
          <div className="admin-features">
            <h3>Можливості панелі:</h3>
            {adminFeatures.map((feature, index) => (
              <div key={index} className="admin-feature">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="admin-stats">
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Моніторинг</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">256-bit</span>
              <span className="stat-label">Шифрування</span>
            </div>
          </div>
        </div>
        
        {/* Права частина з формою */}
        <div className="admin-login-form-section">
          <div className="login-form-container">
            <div className="form-header">
              <h2>Авторизація адміністратора</h2>
              <p>Введіть облікові дані для доступу до панелі управління</p>
            </div>
            
            {/* Відображення загальної помилки */}
            {(error || errors.general) && (
              <div className="error-message">
                <span className="error-text">{error || errors.general}</span>
              </div>
            )}
            
            <form className="admin-login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email адреса</label>
                <div className="input-container">
                  <Email className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@bestflix.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isFetching || isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введіть пароль"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isFetching || isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFetching || isLoading}
                    aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isFetching || isLoading}
                  />
                  <span className="checkmark"></span>
                  Запам'ятати мене
                </label>
                
                <button type="button" className="forgot-password">
                  Забули пароль?
                </button>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isFetching || isLoading}
              >
                {(isFetching || isLoading) ? (
                  <>
                    <div className="loading-spinner"></div>
                    Авторизація...
                  </>
                ) : (
                  <>
                    <AdminPanelSettings className="button-icon" />
                    Увійти в панель
                  </>
                )}
              </button>
            </form>
            
            <div className="security-notice">
              <Security className="security-icon" />
              <p>Ваші дані захищені 256-бітним шифруванням SSL</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="login-footer">
        <p>© 2024 BestFlix. Всі права захищені. | Версія 2.1.0</p>
      </div>
    </div>
  );
}