import { useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { logout } from "../../context/authContext/AuthActions";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("admin_user");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>BestFlix Admin</h1>
          </div>
          
          <div className="header-actions">
            <div className="user-info">
              <span className="welcome-text">Вітаємо, {user?.firstName || user?.username}!</span>
              <div className="user-avatar">
                {(user?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9" stroke="currentColor" strokeWidth="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Вийти
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Панель адміністратора</h2>
          <p>Ласкаво просимо до адміністративної панелі BestFlix</p>
        </div>

        <div className="admin-info-grid">
          <div className="info-card">
            <div className="card-header">
              <h3>Особиста інформація</h3>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="label">Ім'я користувача:</span>
                <span className="value">{user?.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Ім'я:</span>
                <span className="value">{user?.firstName || "Не вказано"}</span>
              </div>
              <div className="info-item">
                <span className="label">Прізвище:</span>
                <span className="value">{user?.lastName || "Не вказано"}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h3>Статус акаунту</h3>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="label">Роль:</span>
                <span className="value admin-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                  Адміністратор
                </span>
              </div>
              <div className="info-item">
                <span className="label">Дата реєстрації:</span>
                <span className="value">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Останній вхід:</span>
                <span className="value">{formatDate(user?.lastLogin)}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h3>Управління користувачами</h3>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                  <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Переглядайте, створюйте та керуйте користувачами системи
              </p>
              <button 
                onClick={() => window.location.href = '/users'}
                className="card-action-btn"
              >
                Перейти до користувачів
              </button>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h3>Управління жанрами</h3>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V7.5L14.5 2Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 9H8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <p className="card-description">
                Створюйте, редагуйте та керуйте жанрами фільмів
              </p>
              <button 
                onClick={() => window.location.href = '/genres'}
                className="card-action-btn"
              >
                Перейти до жанрів
              </button>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h3>Швидкі дії</h3>
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15A1.65 1.65 0 0 0 21 13.09A1.65 1.65 0 0 0 19.4 9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4.6 9A1.65 1.65 0 0 0 3 10.91A1.65 1.65 0 0 0 4.6 15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <div className="actions-grid">
                <button className="action-btn" disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Користувачі
                </button>
                <button className="action-btn" disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Фільми
                </button>
                <button className="action-btn" disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14.5 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V7.5L14.5 2Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Звіти
                </button>
                <button className="action-btn" disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15A1.65 1.65 0 0 0 21 13.09A1.65 1.65 0 0 0 19.4 9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4.6 9A1.65 1.65 0 0 0 3 10.91A1.65 1.65 0 0 0 4.6 15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Налаштування
                </button>
              </div>
              <p className="actions-note">Функції будуть доступні в наступних версіях</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}