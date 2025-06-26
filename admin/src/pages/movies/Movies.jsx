import React, { useState, useEffect } from "react";
import { movieAPI } from "../../api/movieAPI";
import { genreAPI } from "../../api/genreAPI";
import "../../styles/admin-common.css";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
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
    posterImage: "",
    trailerUrl: "",
    videoUrl: "",
    duration: "",
    releaseYear: "",
    country: "",
    language: "",
    ageRating: "PG",
    genres: [],
    director: "",
    cast: "",
    type: "movie",
    pricing: {
      buyPrice: 0,
      isFree: true
    }
  });

  const fetchMovies = async (page = 1) => {
    try {
      setLoading(true);
      const data = await movieAPI.getAll(page, 10);
      
      if (data.success) {
        setMovies(data.movies || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
        setError("");
      } else {
        setError(data.message || "Помилка завантаження фільмів");
      }
    } catch (err) {
      console.error('Fetch movies error:', err);
      setError(err.response?.data?.message || "Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await genreAPI.getAll(1, 100);
      if (data.success) {
        setGenres(data.genres || []);
      }
    } catch (err) {
      console.error('Fetch genres error:', err);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...newMovie,
        cast: newMovie.cast.split(',').map(c => c.trim()).filter(c => c),
        duration: parseInt(newMovie.duration) || 0,
        releaseYear: parseInt(newMovie.releaseYear) || new Date().getFullYear(),
        pricing: {
          buyPrice: parseFloat(newMovie.pricing.buyPrice) || 0,
          isFree: newMovie.pricing.isFree
        }
      };

      const data = await movieAPI.create(movieData);
      
      if (data.success) {
        setShowCreateModal(false);
        setNewMovie({
          title: "",
          description: "",
          posterImage: "",
          trailerUrl: "",
          videoUrl: "",
          duration: "",
          releaseYear: "",
          country: "",
          language: "",
          ageRating: "PG",
          genres: [],
          director: "",
          cast: "",
          type: "movie",
          pricing: {
            buyPrice: 0,
            isFree: true
          }
        });
        fetchMovies(currentPage);
        setError("");
        alert("Фільм успішно створений!");
      } else {
        setError(data.message || "Помилка створення фільму");
      }
    } catch (err) {
      console.error('Create movie error:', err);
      setError(err.response?.data?.message || "Помилка створення фільму");
    }
  };

  const handleEditMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...editingMovie,
        cast: Array.isArray(editingMovie.cast) 
          ? editingMovie.cast 
          : editingMovie.cast.split(',').map(c => c.trim()).filter(c => c),
        duration: parseInt(editingMovie.duration) || 0,
        releaseYear: parseInt(editingMovie.releaseYear) || new Date().getFullYear(),
        pricing: {
          buyPrice: parseFloat(editingMovie.pricing?.buyPrice) || 0,
          isFree: editingMovie.pricing?.isFree || false
        }
      };

      const data = await movieAPI.update(editingMovie._id, movieData);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingMovie(null);
        fetchMovies(currentPage);
        setError("");
        alert("Фільм успішно оновлений!");
      } else {
        setError(data.message || "Помилка оновлення фільму");
      }
    } catch (err) {
      console.error('Update movie error:', err);
      setError(err.response?.data?.message || "Помилка оновлення фільму");
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей фільм?")) {
      try {
        const data = await movieAPI.delete(movieId);
        
        if (data.success) {
          fetchMovies(currentPage);
          setError("");
          alert("Фільм успішно видалений!");
        } else {
          setError(data.message || "Помилка видалення фільму");
        }
      } catch (err) {
        console.error('Delete movie error:', err);
        setError(err.response?.data?.message || "Помилка видалення фільму");
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const data = await movieAPI.search(searchTerm);
        
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
        setError(err.response?.data?.message || "Помилка пошуку");
      } finally {
        setLoading(false);
      }
    } else {
      fetchMovies(1);
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Не вказано";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}г ${mins}хв` : `${mins}хв`;
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  fetchMovies(1);
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
                    <th>Рік</th>
                    <th>Тривалість</th>
                    <th>Жанри</th>
                    <th>Тип</th>
                    <th>Дата створення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        {movie.posterImage ? (
                          <img 
                            src={movie.posterImage} 
                            alt={movie.title}
                            style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '75px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>
                            Без постера
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="font-weight-bold">{movie.title}</div>
                        <div className="text-secondary" style={{ fontSize: '12px' }}>
                          {movie.director && `Реж: ${movie.director}`}
                        </div>
                      </td>
                      <td>{movie.releaseYear}</td>
                      <td>{formatDuration(movie.duration)}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {movie.genres && movie.genres.slice(0, 2).map((genre, index) => (
                            <span key={index} className="badge badge-info" style={{ fontSize: '10px' }}>
                              {genre}
                            </span>
                          ))}
                          {movie.genres && movie.genres.length > 2 && (
                            <span className="badge badge-secondary" style={{ fontSize: '10px' }}>
                              +{movie.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${movie.type === 'movie' ? 'badge-info' : 'badge-warning'}`}>
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                      </td>
                      <td>{formatDate(movie.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setEditingMovie({
                                ...movie,
                                cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
                                pricing: movie.pricing || { buyPrice: 0, isFree: true }
                              });
                              setShowEditModal(true);
                            }}
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

              {filteredMovies.length === 0 && (
                <div className="no-data">
                  {searchTerm ? "Фільми не знайдені" : "Немає фільмів"}
                </div>
              )}
            </div>

            {totalPages > 1 && !searchTerm && (
              <div className="pagination">
                <button
                  onClick={() => fetchMovies(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  ← Попередня
                </button>
                <span className="pagination-info">
                  Сторінка {currentPage} з {totalPages}
                </span>
                <button
                  onClick={() => fetchMovies(currentPage + 1)}
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

      {/* Модальне вікно створення фільму */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
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
                <div className="form-row">
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
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      min="1900"
                      max="2030"
                      value={newMovie.releaseYear}
                      onChange={(e) => setNewMovie({...newMovie, releaseYear: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
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
                    <label className="form-label">URL постера *</label>
                    <input
                      type="url"
                      value={newMovie.posterImage}
                      onChange={(e) => setNewMovie({...newMovie, posterImage: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хвилини)</label>
                    <input
                      type="number"
                      min="1"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
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
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={newMovie.country}
                      onChange={(e) => setNewMovie({...newMovie, country: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип</label>
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
                    <label className="form-label">Віковий рейтинг</label>
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
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={newMovie.cast}
                    onChange={(e) => setNewMovie({...newMovie, cast: e.target.value})}
                    placeholder="Актор 1, Актор 2, Актор 3"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {genres.map((genre) => (
                      <label key={genre._id} className="checkbox-group">
                        <input
                          type="checkbox"
                          checked={newMovie.genres.includes(genre.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewMovie({
                                ...newMovie,
                                genres: [...newMovie.genres, genre.name]
                              });
                            } else {
                              setNewMovie({
                                ...newMovie,
                                genres: newMovie.genres.filter(g => g !== genre.name)
                              });
                            }
                          }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
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

      {/* Модальне вікно редагування фільму */}
      {showEditModal && editingMovie && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
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
                <div className="form-row">
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
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      min="1900"
                      max="2030"
                      value={editingMovie.releaseYear}
                      onChange={(e) => setEditingMovie({...editingMovie, releaseYear: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис *</label>
                  <textarea
                    value={editingMovie.description || ""}
                    onChange={(e) => setEditingMovie({...editingMovie, description: e.target.value})}
                    required
                    rows="3"
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">URL постера *</label>
                    <input
                      type="url"
                      value={editingMovie.posterImage || ""}
                      onChange={(e) => setEditingMovie({...editingMovie, posterImage: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хвилини)</label>
                    <input
                      type="number"
                      min="1"
                      value={editingMovie.duration || ""}
                      onChange={(e) => setEditingMovie({...editingMovie, duration: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Режисер</label>
                    <input
                      type="text"
                      value={editingMovie.director || ""}
                      onChange={(e) => setEditingMovie({...editingMovie, director: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={editingMovie.country || ""}
                      onChange={(e) => setEditingMovie({...editingMovie, country: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип</label>
                    <select
                      value={editingMovie.type || "movie"}
                      onChange={(e) => setEditingMovie({...editingMovie, type: e.target.value})}
                      className="form-select"
                    >
                      <option value="movie">Фільм</option>
                      <option value="series">Серіал</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Віковий рейтинг</label>
                    <select
                      value={editingMovie.ageRating || "PG"}
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
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={editingMovie.cast || ""}
                    onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value})}
                    placeholder="Актор 1, Актор 2, Актор 3"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {genres.map((genre) => (
                      <label key={genre._id} className="checkbox-group">
                        <input
                          type="checkbox"
                          checked={editingMovie.genres && editingMovie.genres.includes(genre.name)}
                          onChange={(e) => {
                            const currentGenres = editingMovie.genres || [];
                            if (e.target.checked) {
                              setEditingMovie({
                                ...editingMovie,
                                genres: [...currentGenres, genre.name]
                              });
                            } else {
                              setEditingMovie({
                                ...editingMovie,
                                genres: currentGenres.filter(g => g !== genre.name)
                              });
                            }
                          }}
                        />
                        <span className="form-label" style={{ margin: 0 }}>{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="submit" className="btn btn-success">
                    Зберегти
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