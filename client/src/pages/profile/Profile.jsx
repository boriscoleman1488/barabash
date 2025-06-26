import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { Link } from 'react-router-dom';
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Перевіряємо тип файлу
      if (!file.type.startsWith('image/')) {
        alert('Будь ласка, оберіть файл зображення');
        return;
      }
      
      // Перевіряємо розмір файлу (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Розмір файлу не повинен перевищувати 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Створюємо превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    try {
      setUploadingImage(true);
      const data = await userAPI.updateProfileImage(profileData._id, selectedImage);
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: data.user.profilePicture
        }));
        setShowImageModal(false);
        setSelectedImage(null);
        setImagePreview(null);
        alert('Фото профілю успішно оновлено!');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Помилка завантаження зображення');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити фото профілю?')) return;
    
    try {
      const data = await userAPI.removeProfileImage(profileData._id);
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: ''
        }));
        alert('Фото профілю видалено');
      }
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Помилка видалення зображення');
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

  const getUserInitials = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return (profileData?.username?.[0] || 'U').toUpperCase();
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
            <div className="user-avatar-section">
              <div className="user-avatar-large">
                {profileData?.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" />
                ) : (
                  <span className="avatar-initials">{getUserInitials()}</span>
                )}
                <button 
                  className="change-avatar-btn"
                  onClick={() => setShowImageModal(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 4H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
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
                          <div className="overlay-buttons">
                            <Link to={`/movie/${movie._id}`} className="info-btn">
                              <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Деталі
                            </Link>
                            <button 
                              className="remove-btn"
                              onClick={() => removeFromFavorites(movie._id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Видалити
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h4>
                          <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
                        </h4>
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
                          <div className="overlay-buttons">
                            <Link to={`/movie/${movie._id}`} className="info-btn">
                              <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Деталі
                            </Link>
                            <Link to="/watch" state={{ movie }} className="play-btn">
                              <svg viewBox="0 0 24 24" fill="none">
                                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                              </svg>
                              Дивитись
                            </Link>
                          </div>
                        </div>
                        <div className="purchased-badge">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h4>
                          <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
                        </h4>
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

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Змінити фото профілю</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowImageModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="image-preview-container">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : profileData?.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Current" className="image-preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>{getUserInitials()}</span>
                  </div>
                )}
              </div>
              
              <div className="upload-controls">
                <label className="file-input-label">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Обрати фото
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <div className="image-actions">
                  <button 
                    className="upload-btn"
                    onClick={handleImageUpload}
                    disabled={!selectedImage || uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="spinner"></div>
                        Завантаження...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Зберегти
                      </>
                    )}
                  </button>
                  
                  {profileData?.profilePicture && (
                    <button 
                      className="remove-btn"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                        <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Видалити фото
                    </button>
                  )}
                </div>
              </div>
              
              <div className="upload-info">
                <p>Підтримувані формати: JPG, PNG, GIF</p>
                <p>Максимальний розмір: 5MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;