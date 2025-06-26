import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../api/categoryAPI';
import { userAPI } from '../../api/userAPI';
import './Categories.scss';

const Categories = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryMovies, setCategoryMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.accessToken) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAll();
      
      if (data.success) {
        setCategories(data.categories);
        setError('');
      } else {
        setError('Помилка завантаження категорій');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryMovies = async (categoryId) => {
    try {
      setMoviesLoading(true);
      const data = await categoryAPI.getById(categoryId);
      
      if (data.success) {
        setCategoryMovies(data.movies || []);
        setError('');
      } else {
        setError('Помилка завантаження фільмів категорії');
      }
    } catch (err) {
      console.error('Error fetching category movies:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setMoviesLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchCategoryMovies(category._id);
  };

  const addToFavorites = async (movieId) => {
    try {
      const data = await userAPI.addToFavorites(movieId);
      if (data.success) {
        alert('Фільм додано до улюблених!');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Помилка додавання до улюблених');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`;
  };

  const getTypeLabel = (type) => {
    return type === 'movie' ? 'Фільм' : 'Серіал';
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'movie':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'series':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="categories-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Завантаження категорій...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Navbar />
      
      <div className="categories-container">
        {/* Header */}
        <div className="categories-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Категорії фільмів</h1>
              <p>Досліджуйте фільми та серіали за категоріями</p>
            </div>
            <Link to="/" className="back-btn">
              <svg viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Назад до головної
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="categories-content">
          {/* Categories Grid */}
          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`category-card ${selectedCategory?._id === category._id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="category-icon">
                  {getCategoryIcon(category.type)}
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Опис відсутній'}</p>
                  <div className="category-meta">
                    <span className={`type-badge ${category.type}`}>
                      {getTypeLabel(category.type)}
                    </span>
                    <span className="movie-count">
                      {category.moviesCount || 0} фільмів
                    </span>
                  </div>
                </div>
                <div className="category-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Category Movies */}
          {selectedCategory && (
            <div className="category-movies-section">
              <div className="section-header">
                <h2>
                  Фільми в категорії "{selectedCategory.name}"
                  <span className="movies-count">({categoryMovies.length})</span>
                </h2>
                <button 
                  className="close-section-btn"
                  onClick={() => setSelectedCategory(null)}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {moviesLoading ? (
                <div className="movies-loading">
                  <div className="loading-spinner"></div>
                  <p>Завантаження фільмів...</p>
                </div>
              ) : categoryMovies.length === 0 ? (
                <div className="empty-movies">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Фільми відсутні</h3>
                  <p>В цій категорії поки що немає фільмів</p>
                </div>
              ) : (
                <div className="category-movies-grid">
                  {categoryMovies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                      <div className="movie-poster">
                        <img src={movie.posterImage} alt={movie.title} />
                        <div className="movie-overlay">
                          <div className="overlay-content">
                            <Link to={`/movie/${movie._id}`} className="info-btn">
                              <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </Link>
                            <Link to="/watch" state={{ movie }} className="play-btn">
                              <svg viewBox="0 0 24 24" fill="none">
                                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                              </svg>
                            </Link>
                            <button 
                              className="favorite-btn"
                              onClick={() => addToFavorites(movie._id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61A5.5 5.5 0 0 0 7.5 7.5L12 12L16.5 7.5A5.5 5.5 0 0 0 20.84 4.61Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          </div>
                          <div className="movie-quick-info">
                            <div className="movie-rating">
                              <svg viewBox="0 0 24 24" fill="none">
                                <polygon points="12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26" fill="currentColor"/>
                              </svg>
                              <span>{movie.rating || 'N/A'}</span>
                            </div>
                            <div className="movie-duration">
                              {formatDuration(movie.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="movie-badges">
                          <span className={`type-badge ${movie.type}`}>
                            {getTypeLabel(movie.type)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="movie-info">
                        <h4 className="movie-title">
                          <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
                        </h4>
                        <p className="movie-year">{movie.releaseYear}</p>
                        
                        <div className="movie-genres">
                          {movie.genres?.slice(0, 2).map((genre, index) => (
                            <span key={index} className="genre-tag">
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres?.length > 2 && (
                            <span className="genre-more">+{movie.genres.length - 2}</span>
                          )}
                        </div>
                      </div>
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

export default Categories;