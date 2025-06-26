import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { userAPI } from '../../api/userAPI';
import { paymentAPI } from '../../api/paymentAPI';
import './Profile.scss';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [purchasedMovies, setPurchasedMovies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user?.accessToken) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getProfile();
      
      if (data.success) {
        setProfileData(data.user);
        setEditData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          username: data.user.username || '',
          email: data.user.email || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Помилка завантаження профілю');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const data = await userAPI.getFavorites();
      if (data.success) {
        setFavoriteMovies(data.movies);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchPurchasedMovies = async () => {
    try {
      const data = await userAPI.getPurchased();
      if (data.success) {
        setPurchasedMovies(data.movies);
      }
    } catch (err) {
      console.error('Error fetching purchased movies:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await paymentAPI.getUserPayments();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const removeFromFavorites = async (movieId) => {
    try {
      const data = await userAPI.removeFromFavorites(movieId);
      if (data.success) {
        setFavoriteMovies(prev => prev.filter(movie => movie._id !== movieId));
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'favorites' && favoriteMovies.length === 0) {
      fetchFavoriteMovies();
    } else if (tab === 'purchased' && purchasedMovies.length === 0) {
      fetchPurchasedMovies();
    } else if (tab === 'payments' && payments.length === 0) {
      fetchPayments();
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const data = await userAPI.updateProfile(profileData._id, editData);
      if (data.success) {
        setProfileData(data.user);
        setEditMode(false);
        alert('Профіль успішно оновлено!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Помилка оновлення профілю');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const formatPrice = (amount, currency = 'UAH') => {
    return `${amount} ${currency}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Очікує', class: 'warning' },
      completed: { text: 'Завершено', class: 'success' },
      failed: { text: 'Помилка', class: 'error' },
      refunded: { text: 'Повернено', class: 'info' },
      cancelled: { text: 'Скасовано', class: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'secondary' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Завантаження профілю...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="error-container">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-hero">
          <div className="hero-background"></div>
          <div className="hero-content">
            <div className="user-avatar-large">
              {(profileData?.firstName?.[0] || profileData?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="user-info">
              <h1>{profileData?.firstName} {profileData?.lastName}</h1>
              <p className="username">@{profileData?.username}</p>
              <p className="email">{profileData?.email}</p>
              <div className="user-badges">
                <span className="badge member">
                  Учасник з {formatDate(profileData?.createdAt)}
                </span>
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">{profileData?.stats?.totalPurchases || 0}</div>
                <div className="stat-label">Придбано</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{formatPrice(profileData?.stats?.totalSpent || 0)}</div>
                <div className="stat-label">Витрачено</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{profileData?.stats?.favoriteMoviesCount || 0}</div>
                <div className="stat-label">Улюблених</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-navigation">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Огляд
            </button>
            <button 
              className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => handleTabChange('favorites')}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61A5.5 5.5 0 0 0 7.5 7.5L12 12L16.5 7.5A5.5 5.5 0 0 0 20.84 4.61Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Улюблені
              <span className="tab-count">{profileData?.stats?.favoriteMoviesCount || 0}</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'purchased' ? 'active' : ''}`}
              onClick={() => handleTabChange('purchased')}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M2 3H22L20 15H4L2 3Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 3L4 15L6 21H18L20 15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Придбані
              <span className="tab-count">{profileData?.stats?.purchasedMoviesCount || 0}</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => handleTabChange('payments')}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Оплати
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="content-grid">
                <div className="info-section">
                  <div className="section-header">
                    <h3>Особиста інформація</h3>
                    <button 
                      className="edit-btn"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4A2 2 0 0 0 2 6V20A2 2 0 0 0 4 22H18A2 2 0 0 0 20 20V13" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18.5 2.5A2.12 2.12 0 0 1 21 5L12 14L8 15L9 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {editMode ? 'Скасувати' : 'Редагувати'}
                    </button>
                  </div>
                  
                  {editMode ? (
                    <form onSubmit={handleEditProfile} className="edit-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Ім'я</label>
                          <input
                            type="text"
                            value={editData.firstName}
                            onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Прізвище</label>
                          <input
                            type="text"
                            value={editData.lastName}
                            onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Ім'я користувача</label>
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData({...editData, username: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="save-btn">Зберегти</button>
                        <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                          Скасувати
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Повне ім'я</span>
                        <span className="value">{profileData?.firstName} {profileData?.lastName}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Ім'я користувача</span>
                        <span className="value">@{profileData?.username}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Email адреса</span>
                        <span className="value">{profileData?.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Дата реєстрації</span>
                        <span className="value">{formatDate(profileData?.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="activity-section">
                  <div className="section-header">
                    <h3>Остання активність</h3>
                  </div>
                  
                  {profileData?.recentPayments && profileData.recentPayments.length > 0 ? (
                    <div className="activity-list">
                      {profileData.recentPayments.map((payment) => (
                        <div key={payment._id} className="activity-item">
                          <div className="activity-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M2 3H22L20 15H4L2 3Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="activity-info">
                            <h4>Придбано "{payment.movieId?.title}"</h4>
                            <p>{formatDate(payment.createdAt)}</p>
                            <span className="price">{formatPrice(payment.amount)}</span>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                        <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <p>Поки що немає активності</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-content">
              <div className="section-header">
                <h3>Улюблені фільми</h3>
                <span className="count">{favoriteMovies.length} фільмів</span>
              </div>
              
              {favoriteMovies.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20.84 4.61A5.5 5.5 0 0 0 7.5 7.5L12 12L16.5 7.5A5.5 5.5 0 0 0 20.84 4.61Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Немає улюблених фільмів</h3>
                  <p>Додайте фільми до улюблених, щоб вони з'явилися тут</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {favoriteMovies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                      <div className="movie-poster">
                        <img src={movie.posterImage} alt={movie.title} />
                        <div className="movie-overlay">
                          <button className="play-btn">
                            <svg viewBox="0 0 24 24" fill="none">
                              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                            </svg>
                          </button>
                          <button 
                            className="remove-btn"
                            onClick={() => removeFromFavorites(movie._id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none">
                              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <span className="movie-type">
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchased' && (
            <div className="purchased-content">
              <div className="section-header">
                <h3>Придбані фільми</h3>
                <span className="count">{purchasedMovies.length} фільмів</span>
              </div>
              
              {purchasedMovies.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M2 3H22L20 15H4L2 3Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Немає придбаних фільмів</h3>
                  <p>Придбайте фільми, щоб вони з'явилися тут</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {purchasedMovies.map((movie) => (
                    <div key={movie._id} className="movie-card purchased">
                      <div className="movie-poster">
                        <img src={movie.posterImage} alt={movie.title} />
                        <div className="movie-overlay">
                          <button className="play-btn">
                            <svg viewBox="0 0 24 24" fill="none">
                              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                        <div className="purchased-badge">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <span className="movie-type">
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                        {movie.purchaseInfo && (
                          <div className="purchase-details">
                            <p>Придбано: {formatDate(movie.purchaseInfo.purchaseDate)}</p>
                            <p>Ціна: {formatPrice(movie.purchaseInfo.price)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="payments-content">
              <div className="section-header">
                <h3>Історія оплат</h3>
                <span className="count">{payments.length} транзакцій</span>
              </div>
              
              {payments.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Немає оплат</h3>
                  <p>Історія ваших оплат з'явиться тут</p>
                </div>
              ) : (
                <div className="payments-list">
                  {payments.map((payment) => (
                    <div key={payment._id} className="payment-item">
                      <div className="payment-movie">
                        <img 
                          src={payment.movieId?.posterImage} 
                          alt={payment.movieId?.title}
                        />
                        <div className="payment-info">
                          <h4>{payment.movieId?.title}</h4>
                          <p>{formatDate(payment.createdAt)}</p>
                          <span className="payment-method">
                            {payment.paymentMethod === 'card' ? 'Картка' : payment.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="payment-amount">
                        {formatPrice(payment.amount, payment.currency)}
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;