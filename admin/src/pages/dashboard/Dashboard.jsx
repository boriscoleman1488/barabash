import { useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { logout } from "../../context/authContext/AuthActions";
import "../../styles/admin-common.css";

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
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="page-title">BestFlix Admin</h1>
          </div>

          <div className="header-actions">
            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary">Вітаємо, {user?.firstName || user?.username}!</span>
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                {(user?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9" stroke="currentColor" strokeWidth="2" />
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              Вийти
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="text-center mb-5">
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Панель адміністратора
          </h2>
          <p className="text-secondary">Ласкаво просимо до адміністративної панелі BestFlix</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Особиста інформація
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Ім'я користувача:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{user?.username}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Email:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{user?.email}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Ім'я:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{user?.firstName || "Не вказано"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Прізвище:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{user?.lastName || "Не вказано"}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Статус акаунту
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Роль:</span>
                <span className="badge badge-success d-flex align-items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                  Адміністратор
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Дата реєстрації:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{formatDate(user?.createdAt)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 0' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '14px' }}>Останній вхід:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{formatDate(user?.lastLogin)}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Управління користувачами
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" strokeWidth="2" />
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" />
                  <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                Переглядайте, створюйте та керуйте користувачами системи
              </p>
              <button
                onClick={() => window.location.href = '/users'}
                className="btn btn-primary"
              >
                Перейти до користувачів
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Управління жанрами
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V7.5L14.5 2Z" stroke="currentColor" strokeWidth="2" />
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                Створюйте, редагуйте та керуйте жанрами фільмів
              </p>
              <button
                onClick={() => window.location.href = '/genres'}
                className="btn btn-primary"
              >
                Перейти до жанрів
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Управління категоріями
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V7.5L14.5 2Z" stroke="currentColor" strokeWidth="2" />
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                Створення, редагування та видалення категорій фільмів
              </p>
              <button
                onClick={() => window.location.href = '/categories'}
                className="btn btn-primary"
              >
                Перейти до категорій
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--card-background)', borderRadius: 'var(--border-radius)', padding: '20px', boxShadow: 'var(--shadow-light)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
                Управління фільмами
              </h3>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                Додавання, редагування та видалення фільмів і серіалів
              </p>
              <button
                onClick={() => window.location.href = '/movies'}
                className="btn btn-primary"
              >
                Перейти до фільмів
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}