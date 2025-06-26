import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { Link } from 'react-router-dom';
import { genreAPI } from '../../api/genreAPI';
import { movieAPI } from '../../api/movieAPI';
import { userAPI } from '../../api/userAPI';
import './Genres.scss';

const Genres = () => {
  const { user } = useContext(AuthContext);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.accessToken) {
      fetchGenres();
    }
  }, [user]);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await genreAPI.getAll(1, 50, true);
      
      if (data.success) {
        setGenres(data.genres);
        setError('');
      } else {
        setError('Помилка завантаження жанрів');
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenreMovies = async (genreId) => {
    try {
      setMoviesLoading(true);
      const data = await movieAPI.getByGenre(genreId);
      
      if (data.success) {
        setGenreMovies(data.movies || []);
        setError('');
      } else {
        setError('Помилка завантаження фільмів жанру');
      }
    } catch (err) {
      console.error('Error fetching genre movies:', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setMoviesLoading(false);
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    fetchGenreMovies(genre._id);
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

  const getGenreIcon = (genreName) => {
    const iconMap = {
      'Action': '⚔️',
      'Adventure': '🗺️',
      'Comedy': '😂',
      'Drama': '🎭',
      'Horror': '👻',
      'Romance': '💕',
      'Sci-Fi': '🚀',
      'Thriller': '🔪',
      'Fantasy': '🧙‍♂️',
      'Crime': '🕵️‍♂️',
      'Animation': '🎨',
      'Documentary': '📹',
      'Western': '🤠',
      'Musical': '🎵',
      'War': '⚔️',
      'Biography': '📖',
      'History': '🏛️',
      'Sport': '⚽',
      'Family': '👨‍👩‍👧‍👦',
      'Mystery': '🔍'
    };
    
    return iconMap[genreName] || '🎬';
  };

  const getMovieStats = (movies) => {
    const movieCount = movies.filter(m => m.type === 'movie').length;
    const seriesCount = movies.filter(m => m.type === 'series').length;
    return { movieCount, seriesCount, total: movies.length };
  };

  if (loading) {
    return (
      <div className="genres-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Завантаження жанрів...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="genres-page">
      <Navbar />
      
      <div className="genres-container">
        {/* Header */}
        <div className="genres-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Жанри фільмів</h1>
              <p>Досліджуйте фільми та серіали за жанрами</p>
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

        <div className="genres-content">
          {/* Genres Grid */}
          <div className="genres-grid">
            {genres.map((genre) => {
              const stats = getMovieStats(genre.movies || []);
              return (
                <div
                  key={genre._id}
                  className={`genre-card ${selectedGenre?._id === genre._id ? 'active' : ''}`}
                  onClick={() => handleGenreSelect(genre)}
                >
                  <div className="genre-icon">
                    <span className="genre-emoji">{getGenreIcon(genre.name)}</span>
                  </div>
                  <div className="genre-info">
                    <h3>{genre.name}</h3>
                    <p>{genre.description || 'Опис відсутній'}</p>
                    <div className="genre-stats">
                      <div className="stat-item">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Всього</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{stats.movieCount}</span>
                        <span className="stat-label">Фільмів</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{stats.seriesCount}</span>
                        <span className="stat-label">Серіалів</span>
                      </div>
                    </div>
                  </div>
                  <div className="genre-arrow">
                    <svg viewBox="0 0 24 24" fill="none">
                      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Genre Movies */}
          {selectedGenre && (
            <div className="genre-movies-section">
              <div className="section-header">
                <h2>
                  Фільми жанру "{selectedGenre.name}"
                  <span className="movies-count">({genreMovies.length})</span>
                </h2>
                <button 
                  className="close-section-btn"
                  onClick={() => setSelectedGenre(null)}
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
              ) : genreMovies.length === 0 ? (
                <div className="empty-movies">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>Фільми відсутні</h3>
                  <p>В цьому жанрі поки що немає фільмів</p>
                </div>
              ) : (
                <div className="genre-movies-grid">
                  {genreMovies.map((movie) => (
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

export default Genres;