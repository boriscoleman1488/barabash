import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { movieAPI } from '../../api/movieAPI';
import { userAPI } from '../../api/userAPI';
import { commentAPI } from '../../api/commentAPI';
import './MovieDetail.scss';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (user?.accessToken && id) {
      fetchMovieDetails();
      fetchComments();
      checkMovieAccess();
    }
  }, [user, id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await movieAPI.getById(id);
      
      if (data.success) {
        setMovie(data.movie);
        setError('');
      } else {
        setError('Фільм не знайдено');
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError('Помилка завантаження фільму');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await commentAPI.getMovieComments(id);
      
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const checkMovieAccess = async () => {
    try {
      const data = await userAPI.checkAccess(id);
      if (data.success) {
        setHasAccess(data.hasAccess);
        setAccessInfo(data);
      }
    } catch (err) {
      console.error('Error checking access:', err);
    }
  };

  const addToFavorites = async () => {
    try {
      const data = await userAPI.addToFavorites(id);
      if (data.success) {
        setIsFavorite(true);
        alert('Фільм додано до улюблених!');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Помилка додавання до улюблених');
    }
  };

  const removeFromFavorites = async () => {
    try {
      const data = await userAPI.removeFromFavorites(id);
      if (data.success) {
        setIsFavorite(false);
        alert('Фільм видалено з улюблених');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const data = await commentAPI.create({
        movieId: id,
        content: newComment.trim()
      });

      if (data) {
        setComments(prev => [data, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Помилка додавання коментаря');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей коментар?')) return;

    try {
      const data = await commentAPI.delete(commentId);
      if (data) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Помилка видалення коментаря');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleWatchMovie = () => {
    if (hasAccess || movie?.pricing?.isFree) {
      navigate('/watch', { state: { movie } });
    } else {
      // Redirect to payment or show payment modal
      alert(`Для перегляду цього фільму потрібно придбати доступ за ${movie?.pricing?.buyPrice} грн`);
    }
  };

  if (loading) {
    return (
      <div className="movie-detail-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Завантаження фільму...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-page">
        <Navbar />
        <div className="error-container">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h2>{error}</h2>
          <Link to="/" className="btn btn-primary">Повернутися на головну</Link>
        </div>
      </div>
    );
  }

  const youtubeVideoId = getYouTubeVideoId(movie.trailerUrl);

  return (
    <div className="movie-detail-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="movie-hero">
        <div className="hero-background">
          <img src={movie.posterImage} alt={movie.title} />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="movie-poster">
            <img src={movie.posterImage} alt={movie.title} />
            <div className="poster-badges">
              <span className={`type-badge ${movie.type}`}>
                {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
              </span>
              {movie.pricing?.isFree ? (
                <span className="price-badge free">Безкоштовно</span>
              ) : (
                <span className="price-badge paid">{movie.pricing?.buyPrice} грн</span>
              )}
            </div>
          </div>
          
          <div className="movie-info">
            <div className="breadcrumb">
              <Link to="/">Головна</Link>
              <span>/</span>
              <span>{movie.title}</span>
            </div>
            
            <h1 className="movie-title">{movie.title}</h1>
            
            <div className="movie-meta">
              <div className="meta-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{formatDuration(movie.duration)}</span>
              </div>
              
              <div className="meta-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{movie.releaseYear}</span>
              </div>
              
              <div className="meta-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26" fill="currentColor"/>
                </svg>
                <span>{movie.rating || 'N/A'}</span>
              </div>
              
              {movie.ageRating && (
                <div className="meta-item">
                  <span className="age-rating">{movie.ageRating}</span>
                </div>
              )}
            </div>
            
            <div className="movie-genres">
              {movie.genres?.map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
            
            <div className="movie-description">
              <p>
                {showFullDescription 
                  ? movie.description 
                  : `${movie.description?.substring(0, 200)}${movie.description?.length > 200 ? '...' : ''}`
                }
              </p>
              {movie.description?.length > 200 && (
                <button 
                  className="read-more-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Згорнути' : 'Читати далі'}
                </button>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn btn-primary play-btn"
                onClick={handleWatchMovie}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
                {hasAccess || movie.pricing?.isFree ? 'Дивитися' : `Придбати за ${movie.pricing?.buyPrice} грн`}
              </button>
              
              {youtubeVideoId && (
                <button 
                  className="btn btn-secondary trailer-btn"
                  onClick={() => setShowTrailer(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                  </svg>
                  Трейлер
                </button>
              )}
              
              <button 
                className={`btn btn-outline favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={isFavorite ? removeFromFavorites : addToFavorites}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61A5.5 5.5 0 0 0 7.5 7.5L12 12L16.5 7.5A5.5 5.5 0 0 0 20.84 4.61Z" 
                        stroke="currentColor" strokeWidth="2" fill={isFavorite ? 'currentColor' : 'none'}/>
                </svg>
                {isFavorite ? 'В улюблених' : 'До улюблених'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="movie-details-container">
        <div className="details-grid">
          {/* Additional Info */}
          <div className="additional-info">
            <h3>Додаткова інформація</h3>
            
            <div className="info-grid">
              {movie.director && (
                <div className="info-item">
                  <span className="label">Режисер:</span>
                  <span className="value">{movie.director}</span>
                </div>
              )}
              
              {movie.country && (
                <div className="info-item">
                  <span className="label">Країна:</span>
                  <span className="value">{movie.country}</span>
                </div>
              )}
              
              {movie.film_language && (
                <div className="info-item">
                  <span className="label">Мова:</span>
                  <span className="value">{movie.film_language}</span>
                </div>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <div className="info-item">
                  <span className="label">Актори:</span>
                  <span className="value">{movie.cast.slice(0, 3).join(', ')}</span>
                </div>
              )}
              
              {movie.categories && movie.categories.length > 0 && (
                <div className="info-item">
                  <span className="label">Категорії:</span>
                  <div className="categories-list">
                    {movie.categories.map((category, index) => (
                      <span key={index} className="category-tag">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="movie-stats">
            <h3>Статистика</h3>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{movie.views || 0}</span>
                  <span className="stat-label">Переглядів</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 9V5A3 3 0 0 0 11 2A3 3 0 0 0 8 5V9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 9H16L17 22H7L8 9Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{movie.likes || 0}</span>
                  <span className="stat-label">Лайків</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polygon points="12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26" fill="currentColor"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{movie.rating || 'N/A'}</span>
                  <span className="stat-label">Рейтинг</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <h3>Коментарі ({comments.length})</h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="add-comment-form">
            <div className="user-avatar">
              {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="comment-input-wrapper">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Залишити коментар..."
                rows="3"
                maxLength="1000"
              />
              <div className="comment-actions">
                <span className="char-count">{newComment.length}/1000</span>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newComment.trim()}
                >
                  Опублікувати
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {commentsLoading ? (
              <div className="comments-loading">
                <div className="loading-spinner"></div>
                <p>Завантаження коментарів...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="empty-comments">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h4>Поки що немає коментарів</h4>
                <p>Будьте першим, хто залишить коментар до цього фільму!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {(comment.userId?.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.userId?.username}</span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      {comment.userId?._id === user?.id && (
                        <button 
                          className="delete-comment-btn"
                          onClick={() => deleteComment(comment._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                            <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && youtubeVideoId && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal-btn"
              onClick={() => setShowTrailer(false)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;