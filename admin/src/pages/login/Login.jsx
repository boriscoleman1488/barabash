import React, { useContext, useState } from "react";
import { login } from "../../context/authContext/apiCalls";
import { AuthContext } from "../../context/authContext/AuthContext";
import "../../styles/admin-common.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { isFetching, dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Будь ласка, заповніть всі поля");
      return;
    }

    try {
      await login(formData, dispatch);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Помилка входу. Перевірте дані.");
    }
  };

  return (
    <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ 
        background: 'var(--card-background)', 
        borderRadius: 'var(--border-radius)', 
        padding: '40px', 
        width: '100%', 
        maxWidth: '400px', 
        boxShadow: 'var(--shadow-light)', 
        border: '1px solid var(--border-color)' 
      }}>
        <div className="text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
            <div className="logo-icon" style={{ width: '40px', height: '40px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
              BestFlix Admin
            </h1>
          </div>
          <p className="text-secondary">Панель адміністратора</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email адреса</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 2 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="email"
                name="email"
                placeholder="admin@bestflix.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 2 }} width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Введіть пароль"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  padding: '4px', 
                  zIndex: 2 
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 18.94 18.94L9.9 4.24Z" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="form-label">Запам'ятати мене</label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isFetching}
            style={{ marginTop: '10px' }}
          >
            {isFetching ? (
              <>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255, 255, 255, 0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Вхід...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Увійти в панель
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}