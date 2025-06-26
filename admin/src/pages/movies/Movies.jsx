import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { movieAPI } from "../../api/movieAPI";
import { genreAPI } from "../../api/genreAPI";
import { categoryAPI } from "../../api/categoryAPI";
import "../../styles/admin-common.css";

export default function Movies() {
  const { user } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    duration: "",
    director: "",
    cast: "",
    country: "",
    film_language: "",
    ageRating: "PG",
    type: "movie",
    genres: [],
    categories: [],
    pricing: {
      buyPrice: 0,
      isFree: true
    },
    seasons: []
  });

  const API_BASE_URL = "http://localhost:5000/api";

  // Створюємо axios instance з токеном
  const getAuthHeaders = () => {
    const adminUserData = localStorage.getItem("admin_user");
    if (adminUserData) {
      try {
        const adminUser = JSON.parse(adminUserData);
        return {
          'token': `Bearer ${adminUser.accessToken}`,
          'Content-Type': 'application/json'
        };
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        return {};
      }
    }
    return {};
  };

  useEffect(() => {
    if (user?.accessToken) {
      fetchMovies();
      fetchGenres();
      fetchCategories();
    }
  }, [user, currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/movies?page=${currentPage}&limit=10`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMovies(data.movies);
        setTotalPages(data.pagination?.pages || 1);
        setError("");
      } else {
        setError(data.message || "Помилка завантаження фільмів");
      }
    } catch (err) {
      console.error('Fetch movies error:', err);
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genres?limit=100`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGenres(data.genres);
      }
    } catch (err) {
      console.error('Fetch genres error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories?limit=100`, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Додаємо основні поля
      Object.keys(newMovie).forEach(key => {
        if (key === 'genres' || key === 'categories') {
          formData.append(key, JSON.stringify(newMovie[key]));
        } else if (key === 'cast') {
          formData.append(key, JSON.stringify(newMovie[key].split(',').map(c => c.trim())));
        } else if (key === 'pricing') {
          formData.append('pricing.buyPrice', newMovie.pricing.buyPrice);
          formData.append('pricing.isFree', newMovie.pricing.isFree);
        } else if (key === 'seasons' && newMovie.type === 'series') {
          formData.append(key, JSON.stringify(newMovie[key]));
        } else {
          formData.append(key, newMovie[key]);
        }
      });

      // Додаємо файли
      const posterFile = document.getElementById('posterImage')?.files[0];
      const videoFile = document.getElementById('videoUrl')?.files[0];
      const trailerFile = document.getElementById('trailerUrl')?.files[0];

      if (posterFile) formData.append('posterImage', posterFile);
      if (videoFile) formData.append('videoUrl', videoFile);
      if (trailerFile) formData.append('trailerUrl', trailerFile);

      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: {
          'token': `Bearer ${JSON.parse(localStorage.getItem("admin_user")).accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setNewMovie({
          title: "",
          description: "",
          releaseYear: new Date().getFullYear(),
          duration: "",
          director: "",
          cast: "",
          country: "",
          film_language: "",
          ageRating: "PG",
          type: "movie",
          genres: [],
          categories: [],
          pricing: {
            buyPrice: 0,
            isFree: true
          },
          seasons: []
        });
        fetchMovies();
        alert("Фільм успішно створений!");
      } else {
        setError(data.message || "Помилка створення фільму");
      }
    } catch (err) {
      console.error('Create movie error:', err);
      setError("Помилка створення фільму");
    }
  };

  const handleEditMovie = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Додаємо основні поля
      Object.keys(editingMovie).forEach(key => {
        if (key === 'genres' || key === 'categories') {
          formData.append(key, JSON.stringify(editingMovie[key]));
        } else if (key === 'cast') {
          formData.append(key, JSON.stringify(editingMovie[key].split(',').map(c => c.trim())));
        } else if (key === 'pricing') {
          formData.append('pricing.buyPrice', editingMovie.pricing.buyPrice);
          formData.append('pricing.isFree', editingMovie.pricing.isFree);
        } else if (key === 'seasons' && editingMovie.type === 'series') {
          formData.append(key, JSON.stringify(editingMovie[key]));
        } else if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          formData.append(key, editingMovie[key]);
        }
      });

      // Додаємо файли якщо є
      const posterFile = document.getElementById('editPosterImage')?.files[0];
      const videoFile = document.getElementById('editVideoUrl')?.files[0];
      const trailerFile = document.getElementById('editTrailerUrl')?.files[0];

      if (posterFile) formData.append('posterImage', posterFile);
      if (videoFile) formData.append('videoUrl', videoFile);
      if (trailerFile) formData.append('trailerUrl', trailerFile);

      const response = await fetch(`${API_BASE_URL}/movies/${editingMovie._id}`, {
        method: 'PUT',
        headers: {
          'token': `Bearer ${JSON.parse(localStorage.getItem("admin_user")).accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setEditingMovie(null);
        fetchMovies();
        alert("Фільм успішно оновлений!");
      } else {
        setError(data.message || "Помилка оновлення фільму");
      }
    } catch (err) {
      console.error('Update movie error:', err);
      setError("Помилка оновлення фільму");
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей фільм?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data = await response.json();
        
        if (data.success) {
          fetchMovies();
          alert("Фільм успішно видалений!");
        } else {
          setError(data.message || "Помилка видалення фільму");
        }
      } catch (err) {
        console.error('Delete movie error:', err);
        setError("Помилка видалення фільму");
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/movies/search?q=${searchTerm}`, {
          headers: getAuthHeaders()
        });

        const data = await response.json();
        
        if (data.success) {
          setMovies(data.movies || []);
          setTotalPages(1);
          setCurrentPage(1);
          setError("");
        } else {
          setError(data.message || "Помилка пошуку");
        }
      } catch (err) {
        console.error('Search movies error:', err);
        setError("Помилка пошуку");
      } finally {
        setLoading(false);
      }
    } else {
      fetchMovies();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`;
  };

  const openEditModal = (movie) => {
    setEditingMovie({
      ...movie,
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      genres: movie.genres?.map(g => g.name || g) || [],
      categories: movie.categories?.map(c => c.name || c) || [],
      pricing: movie.pricing || { buyPrice: 0, isFree: true }
    });
    setShowEditModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="page-title">Управління фільмами</h1>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-secondary"
            >
              ← Назад до Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="page-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Пошук фільмів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              Пошук
            </button>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  fetchMovies();
                }} 
                className="btn btn-outline"
              >
                Очистити
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-success"
          >
            + Створити фільм
          </button>
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Постер</th>
                    <th>Назва</th>
                    <th>Тип</th>
                    <th>Рік</th>
                    <th>Тривалість</th>
                    <th>Жанри</th>
                    <th>Дата створення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        <img 
                          src={movie.posterImage} 
                          alt={movie.title}
                          style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <div className="font-weight-bold">{movie.title}</div>
                        <div className="text-secondary" style={{ fontSize: '12px' }}>
                          {movie.description?.substring(0, 50)}...
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${movie.type === 'movie' ? 'badge-info' : 'badge-warning'}`}>
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                      </td>
                      <td>{movie.releaseYear}</td>
                      <td>{formatDuration(movie.duration)}</td>
                      <td>
                        {movie.genres?.slice(0, 2).map((genre, index) => (
                          <span key={index} className="badge badge-secondary" style={{ marginRight: '4px' }}>
                            {genre.name}
                          </span>
                        ))}
                        {movie.genres?.length > 2 && (
                          <span className="text-muted">+{movie.genres.length - 2}</span>
                        )}
                      </td>
                      <td>{formatDate(movie.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(movie)}
                            className="action-btn action-btn-edit"
                            title="Редагувати фільм"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => handleDeleteMovie(movie._id)}
                            className="action-btn action-btn-delete"
                            title="Видалити фільм"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {movies.length === 0 && (
                <div className="no-data">
                  {searchTerm ? "Фільми не знайдені" : "Немає фільмів"}
                </div>
              )}
            </div>

            {totalPages > 1 && !searchTerm && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  ← Попередня
                </button>
                <span className="pagination-info">
                  Сторінка {currentPage} з {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Наступна →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Movie Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Додати новий фільм</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateMovie}>
                <div className="form-group">
                  <label className="form-label">Назва фільму *</label>
                  <input
                    type="text"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис *</label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                    required
                    rows="3"
                    className="form-textarea"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={newMovie.type}
                      onChange={(e) => setNewMovie({...newMovie, type: e.target.value})}
                      className="form-select"
                    >
                      <option value="movie">Фільм</option>
                      <option value="series">Серіал</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      value={newMovie.releaseYear}
                      onChange={(e) => setNewMovie({...newMovie, releaseYear: parseInt(e.target.value)})}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тривалість (хвилини)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: parseInt(e.target.value)})}
                      min="1"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={newMovie.ageRating}
                      onChange={(e) => setNewMovie({...newMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Режисер</label>
                  <input
                    type="text"
                    value={newMovie.director}
                    onChange={(e) => setNewMovie({...newMovie, director: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={newMovie.cast}
                    onChange={(e) => setNewMovie({...newMovie, cast: e.target.value})}
                    placeholder="Актор 1, Актор 2, Актор 3"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={newMovie.country}
                      onChange={(e) => setNewMovie({...newMovie, country: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <input
                      type="text"
                      value={newMovie.film_language}
                      onChange={(e) => setNewMovie({...newMovie, film_language: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Жанри (через кому)</label>
                  <input
                    type="text"
                    value={newMovie.genres.join(', ')}
                    onChange={(e) => setNewMovie({...newMovie, genres: e.target.value.split(',').map(g => g.trim()).filter(g => g)})}
                    placeholder="Жанр 1, Жанр 2, Жанр 3"
                    className="form-input"
                  />
                  <div className="input-hint">
                    Доступні жанри: {genres.map(g => g.name).join(', ')}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Категорії (через кому)</label>
                  <input
                    type="text"
                    value={newMovie.categories.join(', ')}
                    onChange={(e) => setNewMovie({...newMovie, categories: e.target.value.split(',').map(c => c.trim()).filter(c => c)})}
                    placeholder="Категорія 1, Категорія 2"
                    className="form-input"
                  />
                  <div className="input-hint">
                    Доступні категорії: {categories.map(c => c.name).join(', ')}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ціна (грн)</label>
                    <input
                      type="number"
                      value={newMovie.pricing.buyPrice}
                      onChange={(e) => setNewMovie({
                        ...newMovie, 
                        pricing: {...newMovie.pricing, buyPrice: parseFloat(e.target.value) || 0}
                      })}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={newMovie.pricing.isFree}
                      onChange={(e) => setNewMovie({
                        ...newMovie, 
                        pricing: {...newMovie.pricing, isFree: e.target.checked}
                      })}
                    />
                    <label htmlFor="isFree" className="form-label">
                      Безкоштовний
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Постер *</label>
                  <input
                    type="file"
                    id="posterImage"
                    accept="image/*"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Трейлер (відео файл або YouTube URL)</label>
                  <input
                    type="file"
                    id="trailerUrl"
                    accept="video/*"
                    className="form-input"
                  />
                  <div className="input-hint">
                    Або введіть YouTube URL:
                  </div>
                  <input
                    type="url"
                    value={newMovie.trailerUrl || ''}
                    onChange={(e) => setNewMovie({...newMovie, trailerUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Відео {newMovie.type === 'series' ? '(для серіалів - опціонально)' : ''}</label>
                  <input
                    type="file"
                    id="videoUrl"
                    accept="video/*"
                    className="form-input"
                  />
                </div>

                {newMovie.type === 'series' && (
                  <div className="form-group">
                    <label className="form-label">Сезони (JSON формат)</label>
                    <textarea
                      value={JSON.stringify(newMovie.seasons, null, 2)}
                      onChange={(e) => {
                        try {
                          const seasons = JSON.parse(e.target.value);
                          setNewMovie({...newMovie, seasons});
                        } catch (err) {
                          // Ignore invalid JSON
                        }
                      }}
                      rows="5"
                      placeholder='[{"seasonNumber": 1, "episodes": [{"episodeNumber": 1, "title": "Епізод 1", "description": "Опис", "duration": 45, "videoUrl": "url"}]}]'
                      className="form-textarea"
                    />
                  </div>
                )}
                
                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">
                    Створити
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {showEditModal && editingMovie && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Редагувати фільм</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditMovie}>
                <div className="form-group">
                  <label className="form-label">Назва фільму *</label>
                  <input
                    type="text"
                    value={editingMovie.title}
                    onChange={(e) => setEditingMovie({...editingMovie, title: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис *</label>
                  <textarea
                    value={editingMovie.description}
                    onChange={(e) => setEditingMovie({...editingMovie, description: e.target.value})}
                    required
                    rows="3"
                    className="form-textarea"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={editingMovie.type}
                      onChange={(e) => setEditingMovie({...editingMovie, type: e.target.value})}
                      className="form-select"
                    >
                      <option value="movie">Фільм</option>
                      <option value="series">Серіал</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      value={editingMovie.releaseYear}
                      onChange={(e) => setEditingMovie({...editingMovie, releaseYear: parseInt(e.target.value)})}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тривалість (хвилини)</label>
                    <input
                      type="number"
                      value={editingMovie.duration || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})}
                      min="1"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={editingMovie.ageRating || 'PG'}
                      onChange={(e) => setEditingMovie({...editingMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Режисер</label>
                  <input
                    type="text"
                    value={editingMovie.director || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, director: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={editingMovie.cast || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value})}
                    placeholder="Актор 1, Актор 2, Актор 3"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={editingMovie.country || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, country: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <input
                      type="text"
                      value={editingMovie.film_language || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, film_language: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Жанри (через кому)</label>
                  <input
                    type="text"
                    value={editingMovie.genres?.join(', ') || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, genres: e.target.value.split(',').map(g => g.trim()).filter(g => g)})}
                    placeholder="Жанр 1, Жанр 2, Жанр 3"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Категорії (через кому)</label>
                  <input
                    type="text"
                    value={editingMovie.categories?.join(', ') || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, categories: e.target.value.split(',').map(c => c.trim()).filter(c => c)})}
                    placeholder="Категорія 1, Категорія 2"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ціна (грн)</label>
                    <input
                      type="number"
                      value={editingMovie.pricing?.buyPrice || 0}
                      onChange={(e) => setEditingMovie({
                        ...editingMovie, 
                        pricing: {...(editingMovie.pricing || {}), buyPrice: parseFloat(e.target.value) || 0}
                      })}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="editIsFree"
                      checked={editingMovie.pricing?.isFree || false}
                      onChange={(e) => setEditingMovie({
                        ...editingMovie, 
                        pricing: {...(editingMovie.pricing || {}), isFree: e.target.checked}
                      })}
                    />
                    <label htmlFor="editIsFree" className="form-label">
                      Безкоштовний
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Постер (залишити пустим, щоб не змінювати)</label>
                  <input
                    type="file"
                    id="editPosterImage"
                    accept="image/*"
                    className="form-input"
                  />
                  {editingMovie.posterImage && (
                    <div className="current-file">
                      <img src={editingMovie.posterImage} alt="Current poster" style={{width: '100px', height: '150px', objectFit: 'cover', marginTop: '8px'}} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Трейлер (залишити пустим, щоб не змінювати)</label>
                  <input
                    type="file"
                    id="editTrailerUrl"
                    accept="video/*"
                    className="form-input"
                  />
                  <div className="input-hint">
                    Або введіть YouTube URL:
                  </div>
                  <input
                    type="url"
                    value={editingMovie.trailerUrl || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, trailerUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Відео (залишити пустим, щоб не змінювати)</label>
                  <input
                    type="file"
                    id="editVideoUrl"
                    accept="video/*"
                    className="form-input"
                  />
                </div>

                {editingMovie.type === 'series' && (
                  <div className="form-group">
                    <label className="form-label">Сезони (JSON формат)</label>
                    <textarea
                      value={JSON.stringify(editingMovie.seasons || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const seasons = JSON.parse(e.target.value);
                          setEditingMovie({...editingMovie, seasons});
                        } catch (err) {
                          // Ignore invalid JSON
                        }
                      }}
                      rows="5"
                      className="form-textarea"
                    />
                  </div>
                )}
                
                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">
                    Зберегти зміни
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-secondary"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}