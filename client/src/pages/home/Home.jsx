import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.scss';

const Home = ({ type }) => {
  const { user } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      fetchGenres();
      fetchCategories();
      fetchMovies();
    }
  }, [user, type, selectedGenre, selectedCategory, currentPage]);

  const fetchGenres = async () => {
    try {
      const response = await apiClient.get('/genres?withMovieCount=true');
      if (response.data.success) {
        setGenres(response.data.genres);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (type) params.append('type', type);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await apiClient.get(`/movies?${params}`);
      
      if (response.data.success) {
        setMovies(response.data.movies);
        setTotalPages(response.data.pagination?.pages || 1);
        setError('');
      } else {
        setError('Помилка завантаження фільмів');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (movieId) => {
    try {
      const response = await apiClient.post('/users/favorites', { movieId });
      if (response.data.success) {
        alert('Фільм додано до улюблених!');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Помилка додавання до улюблених');
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedGenre('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`;
  };

  const getTypeLabel = (movieType) => {
    return movieType === 'movie' ? 'Фільм' : 'Серіал';
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-background"></div>
          <div className="hero-content">
            <div className="hero-text">
              <h1>Ласкаво просимо до BestFlix</h1>
              <p>Відкрийте для себе тисячі фільмів та серіалів у найкращій якості</p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="number">{movies.length}</span>
                  <span className="label">Фільмів</span>
                </div>
                <div className="stat">
                  <span className="number">{genres.length}</span>
                  <span className="label">Жанрів</span>
                </div>
                <div className="stat">
                  <span className="number">{categories.length}</span>
                  <span className="label">Категорій</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <h2>Фільтри</h2>
            {(selectedGenre || selectedCategory) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                <svg viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Очистити фільтри
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Genres */}
            <div className="filter-group">
              <h3>Жанри</h3>
              <div className="filter-chips">
                {genres.map((genre) => (
                  <button
                    key={genre._id}
                    className={`filter-chip ${selectedGenre === genre._id ? 'active' : ''}`}
                    onClick={() => handleGenreChange(genre._id)}
                  >
                    {genre.name}
                    <span className="chip-count">{genre.moviesCount || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <h3>Категорії</h3>
              <div className="filter-chips">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className={`filter-chip ${selectedCategory === category._id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category._id)}
                  >
                    {category.name}
                    <span className="chip-badge">{category.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="movies-section">
          <div className="section-header">
            <h2>
              {type ? getTypeLabel(type) : 'Всі фільми'}
              {selectedGenre && (
                <span className="filter-indicator">
                  • {genres.find(g => g._id === selectedGenre)?.name}
                </span>
              )}
              {selectedCategory && (
                <span className="filter-indicator">
                  • {categories.find(c => c._id === selectedCategory)?.name}
                </span>
              )}
            </h2>
            <div className="view-options">
              <Link to="/categories" className="view-all-btn">
                Переглянути категорії
                <svg viewBox="0 0 24 24" fill="none">
                  <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
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

          {loading ? (
            <div className="loading-grid">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="movie-card-skeleton">
                  <div className="skeleton-poster"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-info"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
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
                        {movie.pricing?.isFree ? (
                          <span className="price-badge free">Безкоштовно</span>
                        ) : (
                          <span className="price-badge paid">{movie.pricing?.buyPrice} грн</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="movie-info">
                      <h3 className="movie-title">
                        <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
                      </h3>
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
                      
                      <p className="movie-description">
                        {movie.description?.length > 100 
                          ? `${movie.description.substring(0, 100)}...` 
                          : movie.description
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {movies.length === 0 && !loading && (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Фільми не знайдені</h3>
                  <p>Спробуйте змінити фільтри або очистити пошук</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Попередня
                  </button>
                  
                  <div className="pagination-info">
                    <span>Сторінка {currentPage} з {totalPages}</span>
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Наступна
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;