import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import axios from 'axios';
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

  const API_BASE_URL = "http://localhost:5000/api";

  // Створюємо axios instance з токеном
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'token': `Bearer ${user?.accessToken}`
    }
  });

  useEffect(() => {
    if (user?.accessToken) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/profile');
      
      if (response.data.success) {
        setProfileData(response.data.user);
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
      const response = await apiClient.get('/users/favorites');
      if (response.data.success) {
        setFavoriteMovies(response.data.movies);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchPurchasedMovies = async () => {
    try {
      const response = await apiClient.get('/users/purchased');
      if (response.data.success) {
        setPurchasedMovies(response.data.movies);
      }
    } catch (err) {
      console.error('Error fetching purchased movies:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get('/payments/my');
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const removeFromFavorites = async (movieId) => {
    try {
      const response = await apiClient.delete(`/users/favorites/${movieId}`);
      if (response.data.success) {
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
        <div className="loading">Завантаження профілю...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="user-avatar">
            {(profileData?.firstName?.[0] || profileData?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="user-info">
            <h1>{profileData?.firstName} {profileData?.lastName}</h1>
            <p className="username">@{profileData?.username}</p>
            <p className="email">{profileData?.email}</p>
            <div className="user-stats">
              <div className="stat">
                <span className="stat-number">{profileData?.stats?.totalPurchases || 0}</span>
                <span className="stat-label">Придбано фільмів</span>
              </div>
              <div className="stat">
                <span className="stat-number">{formatPrice(profileData?.stats?.totalSpent || 0)}</span>
                <span className="stat-label">Витрачено</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData?.stats?.favoriteMoviesCount || 0}</span>
                <span className="stat-label">Улюблених</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Огляд
          </button>
          <button 
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            Улюблені ({profileData?.stats?.favoriteMoviesCount || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'purchased' ? 'active' : ''}`}
            onClick={() => handleTabChange('purchased')}
          >
            Придбані ({profileData?.stats?.purchasedMoviesCount || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => handleTabChange('payments')}
          >
            Оплати
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-cards">
                <div className="info-card">
                  <h3>Особиста інформація</h3>
                  <div className="info-item">
                    <span className="label">Ім'я:</span>
                    <span className="value">{profileData?.firstName || 'Не вказано'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Прізвище:</span>
                    <span className="value">{profileData?.lastName || 'Не вказано'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{profileData?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Дата реєстрації:</span>
                    <span className="value">{formatDate(profileData?.createdAt)}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Статистика активності</h3>
                  <div className="info-item">
                    <span className="label">Загальна кількість покупок:</span>
                    <span className="value">{profileData?.stats?.totalPurchases || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Загальна сума витрат:</span>
                    <span className="value">{formatPrice(profileData?.stats?.totalSpent || 0)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Улюблених фільмів:</span>
                    <span className="value">{profileData?.stats?.favoriteMoviesCount || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Придбаних фільмів:</span>
                    <span className="value">{profileData?.stats?.purchasedMoviesCount || 0}</span>
                  </div>
                </div>
              </div>

              {profileData?.recentPayments && profileData.recentPayments.length > 0 && (
                <div className="recent-activity">
                  <h3>Останні покупки</h3>
                  <div className="activity-list">
                    {profileData.recentPayments.map((payment) => (
                      <div key={payment._id} className="activity-item">
                        <img 
                          src={payment.movieId?.posterImage} 
                          alt={payment.movieId?.title}
                          className="movie-poster"
                        />
                        <div className="activity-info">
                          <h4>{payment.movieId?.title}</h4>
                          <p>{formatDate(payment.createdAt)}</p>
                          <span className="price">{formatPrice(payment.amount)}</span>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-tab">
              {favoriteMovies.length === 0 ? (
                <div className="empty-state">
                  <h3>Немає улюблених фільмів</h3>
                  <p>Додайте фільми до улюблених, щоб вони з'явилися тут</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {favoriteMovies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                      <img 
                        src={movie.posterImage} 
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <span className="movie-type">
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromFavorites(movie._id)}
                        >
                          Видалити з улюблених
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchased' && (
            <div className="purchased-tab">
              {purchasedMovies.length === 0 ? (
                <div className="empty-state">
                  <h3>Немає придбаних фільмів</h3>
                  <p>Придбайте фільми, щоб вони з'явилися тут</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {purchasedMovies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                      <img 
                        src={movie.posterImage} 
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <span className="movie-type">
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                        {movie.purchaseInfo && (
                          <div className="purchase-info">
                            <p>Придбано: {formatDate(movie.purchaseInfo.purchaseDate)}</p>
                            <p>Ціна: {formatPrice(movie.purchaseInfo.price)}</p>
                            {movie.purchaseInfo.expiryDate && (
                              <p>Доступ до: {formatDate(movie.purchaseInfo.expiryDate)}</p>
                            )}
                          </div>
                        )}
                        <button className="watch-btn">
                          Дивитися
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="payments-tab">
              {payments.length === 0 ? (
                <div className="empty-state">
                  <h3>Немає оплат</h3>
                  <p>Історія ваших оплат з'явиться тут</p>
                </div>
              ) : (
                <div className="payments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Фільм</th>
                        <th>Сума</th>
                        <th>Дата</th>
                        <th>Статус</th>
                        <th>Метод оплати</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id}>
                          <td>
                            <div className="payment-movie">
                              <img 
                                src={payment.movieId?.posterImage} 
                                alt={payment.movieId?.title}
                                className="payment-poster"
                              />
                              <span>{payment.movieId?.title}</span>
                            </div>
                          </td>
                          <td>{formatPrice(payment.amount, payment.currency)}</td>
                          <td>{formatDate(payment.createdAt)}</td>
                          <td>{getStatusBadge(payment.status)}</td>
                          <td className="payment-method">
                            {payment.paymentMethod === 'card' ? 'Картка' : payment.paymentMethod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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