import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { Link } from 'react-router-dom';
import { movieAPI } from '../../api/movieAPI';
import { genreAPI } from '../../api/genreAPI';
import { categoryAPI } from '../../api/categoryAPI';
import { userAPI } from '../../api/userAPI';
import './Home.scss';

const Home = ({ type }) => {
  const { user } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.accessToken) {
      fetchGenres();
      fetchCategories();
      fetchMovies();
    }
  }, [user, type, selectedGenre, selectedCategory, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchGenres = async () => {
    try {
      const data = await genreAPI.getAll(1, 50, true);
      if (data.success) {
        setGenres(data.genres);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll(1, 50);
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const filters = {
        type,
        genre: selectedGenre,
        category: selectedCategory
      };

      const data = await movieAPI.getAll(currentPage, 12, filters);
      
      if (data.success) {
        setMovies(data.movies);
        setTotalPages(data.pagination?.pages || 1);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setIsSearching(true);
      const data = await movieAPI.search(searchTerm, 1, 20);
      
      if (data.success) {
        setSearchResults(data.movies);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching movies:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setSelectedCategory('');
    setCurrentPage(1);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedGenre('');
    setCurrentPage(1);
    setSearchTerm('');
    setSearchResults([]);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedCategory('');
    setCurrentPage(1);
    setSearchTerm('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
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

  const displayMovies = searchTerm.trim() ? searchResults : movies;
  const isShowingSearchResults = searchTerm.trim() && searchResults.length > 0;

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

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Пошук фільмів та серіалів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              )}
              {isSearching && (
                <div className="search-loading">
                  <div className="search-spinner"></div>
                </div>
              )}
            </div>
            
            {searchTerm && searchResults.length > 0 && (
              <div className="search-results-info">
                Знайдено {searchResults.length} результатів для "{searchTerm}"
              </div>
            )}
            
            {searchTerm && !isSearching && searchResults.length === 0 && (
              <div className="no-search-results">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>Нічого не знайдено для "{searchTerm}"</p>
                <span>Спробуйте інші ключові слова</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section - Hide when searching */}
        {!searchTerm && (
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
        )}

        {/* Movies Section */}
        <div className="movies-section">
          <div className="section-header">
            <h2>
              {isShowingSearchResults ? (
                `Результати пошуку`
              ) : (
                <>
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
                </>
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
                {displayMovies.map((movie) => (
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

              {displayMovies.length === 0 && !loading && (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Фільми не знайдені</h3>
                  <p>Спробуйте змінити фільтри або очистити пошук</p>
                </div>
              )}

              {totalPages > 1 && !searchTerm && (
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