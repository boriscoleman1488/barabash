import React, { useState, useEffect } from "react";
import { movieAPI } from "../../api/movieAPI";
import { genreAPI } from "../../api/genreAPI";
import { categoryAPI } from "../../api/categoryAPI";
import "../../styles/admin-common.css";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    duration: "",
    country: "",
    film_language: "",
    director: "",
    cast: "",
    type: "movie",
    ageRating: "PG",
    "pricing.isFree": true,
    "pricing.buyPrice": 0
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
      const data = await genreAPI.getAll();
      if (data.success) {
        setGenres(data.genres || []);
      }
    } catch (err) {
      console.error('Fetch genres error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Додаємо основні дані фільму
      Object.keys(newMovie).forEach(key => {
        if (newMovie[key] !== undefined && newMovie[key] !== null) {
          formData.append(key, newMovie[key]);
        }
      });
      
      // Додаємо жанри
      if (selectedGenres.length > 0) {
        formData.append('genres', JSON.stringify(selectedGenres));
      }
      
      // Додаємо категорії
      if (selectedCategories.length > 0) {
        formData.append('categories', JSON.stringify(selectedCategories));
      }
      
      // Додаємо акторів
      if (newMovie.cast) {
        formData.append('cast', newMovie.cast);
      }
      
      // Додаємо файли
      if (posterFile) {
        formData.append('posterImage', posterFile);
      }
      
      if (trailerFile) {
        formData.append('trailerUrl', trailerFile);
      }
      
      if (videoFile) {
        formData.append('videoUrl', videoFile);
      }
      
      // Додаємо сезони для серіалів
      if (newMovie.type === 'series' && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
      }
      
      const data = await movieAPI.createWithFiles(formData);
      
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchMovies(currentPage);
        setError("");
        alert("Фільм успішно створено!");
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
      const formData = new FormData();
      
      // Додаємо основні дані фільму
      Object.keys(editingMovie).forEach(key => {
        if (editingMovie[key] !== undefined && editingMovie[key] !== null && 
            key !== 'genres' && key !== 'categories' && key !== '_id' && 
            key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          formData.append(key, editingMovie[key]);
        }
      });
      
      // Додаємо жанри
      if (selectedGenres.length > 0) {
        formData.append('genres', JSON.stringify(selectedGenres));
      }
      
      // Додаємо категорії
      if (selectedCategories.length > 0) {
        formData.append('categories', JSON.stringify(selectedCategories));
      }
      
      // Додаємо акторів
      if (editingMovie.cast) {
        if (Array.isArray(editingMovie.cast)) {
          formData.append('cast', editingMovie.cast.join(', '));
        } else {
          formData.append('cast', editingMovie.cast);
        }
      }
      
      // Додаємо файли
      if (posterFile) {
        formData.append('posterImage', posterFile);
      }
      
      if (trailerFile) {
        formData.append('trailerUrl', trailerFile);
      }
      
      if (videoFile) {
        formData.append('videoUrl', videoFile);
      }
      
      // Додаємо сезони для серіалів
      if (editingMovie.type === 'series' && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
      }
      
      const data = await movieAPI.updateWithFiles(editingMovie._id, formData);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingMovie(null);
        resetForm();
        fetchMovies(currentPage);
        setError("");
        alert("Фільм успішно оновлено!");
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
          alert("Фільм успішно видалено!");
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
          setTotalPages(data.pagination?.pages || 1);
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

  const resetForm = () => {
    setNewMovie({
      title: "",
      description: "",
      releaseYear: new Date().getFullYear(),
      duration: "",
      country: "",
      film_language: "",
      director: "",
      cast: "",
      type: "movie",
      ageRating: "PG",
      "pricing.isFree": true,
      "pricing.buyPrice": 0
    });
    setSelectedGenres([]);
    setSelectedCategories([]);
    setPosterFile(null);
    setTrailerFile(null);
    setVideoFile(null);
    setSeasons([]);
  };

  const openEditModal = (movie) => {
    setEditingMovie({ ...movie });
    
    // Встановлюємо вибрані жанри
    if (movie.genres) {
      setSelectedGenres(movie.genres.map(genre => genre.name));
    }
    
    // Встановлюємо вибрані категорії
    if (movie.categories) {
      setSelectedCategories(movie.categories.map(category => category.name));
    }
    
    // Встановлюємо сезони для серіалів
    if (movie.type === 'series' && movie.seasons) {
      setSeasons(movie.seasons);
    } else {
      setSeasons([]);
    }
    
    setShowEditModal(true);
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    if (value && !selectedGenres.includes(value)) {
      setSelectedGenres([...selectedGenres, value]);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value && !selectedCategories.includes(value)) {
      setSelectedCategories([...selectedCategories, value]);
    }
  };

  const removeGenre = (genre) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const removeCategory = (category) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addSeason = () => {
    setSeasons([...seasons, { seasonNumber: seasons.length + 1, episodes: [] }]);
  };

  const removeSeason = (index) => {
    const newSeasons = [...seasons];
    newSeasons.splice(index, 1);
    
    // Перенумеровуємо сезони
    newSeasons.forEach((season, idx) => {
      season.seasonNumber = idx + 1;
    });
    
    setSeasons(newSeasons);
  };

  const addEpisode = (seasonIndex) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.push({
      episodeNumber: newSeasons[seasonIndex].episodes.length + 1,
      title: '',
      description: '',
      duration: '',
      videoUrl: ''
    });
    setSeasons(newSeasons);
  };

  const removeEpisode = (seasonIndex, episodeIndex) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
    
    // Перенумеровуємо епізоди
    newSeasons[seasonIndex].episodes.forEach((episode, idx) => {
      episode.episodeNumber = idx + 1;
    });
    
    setSeasons(newSeasons);
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex][field] = value;
    setSeasons(newSeasons);
  };

  const handleEpisodeFileChange = (seasonIndex, episodeIndex, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newSeasons = [...seasons];
      newSeasons[seasonIndex].episodes[episodeIndex].videoFile = file;
      newSeasons[seasonIndex].episodes[episodeIndex].videoFileName = file.name;
      setSeasons(newSeasons);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
    fetchCategories();
  }, []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  fetchMovies(1);
                }} 
                className="btn btn-outline"
              >
                Очистити
              </button>
            )}
          </div>
          
          <button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="btn btn-success"
          >
            + Додати фільм
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
                    <th>Жанри</th>
                    <th>Ціна</th>
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
                      <td className="font-weight-bold">{movie.title}</td>
                      <td>
                        <span className={`badge ${movie.type === 'movie' ? 'badge-info' : 'badge-warning'}`}>
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                      </td>
                      <td>{movie.releaseYear}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {movie.genres?.map((genre, index) => (
                            <span key={index} className="badge badge-secondary">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {movie.pricing?.isFree ? (
                          <span className="badge badge-success">Безкоштовно</span>
                        ) : (
                          <span className="badge badge-warning">{movie.pricing?.buyPrice} грн</span>
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

      {/* Модальне вікно для створення фільму */}
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
                    rows="4"
                    required
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={newMovie.type}
                      onChange={(e) => {
                        setNewMovie({...newMovie, type: e.target.value});
                        if (e.target.value !== 'series') {
                          setSeasons([]);
                        }
                      }}
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
                      onChange={(e) => setNewMovie({...newMovie, releaseYear: e.target.value})}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
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
                      <option value="G">G (без обмежень)</option>
                      <option value="PG">PG (рекомендовано з батьками)</option>
                      <option value="PG-13">PG-13 (від 13 років)</option>
                      <option value="R">R (до 17 з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
                    </select>
                  </div>
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
                    className="form-input"
                    placeholder="Актор 1, Актор 2, Актор 3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div className="form-row">
                    <select
                      onChange={handleGenreChange}
                      className="form-select"
                      value=""
                    >
                      <option value="" disabled>Оберіть жанр</option>
                      {genres.map(genre => (
                        <option key={genre._id} value={genre.name}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-items">
                    {selectedGenres.map(genre => (
                      <div key={genre} className="selected-item">
                        <span>{genre}</span>
                        <button type="button" onClick={() => removeGenre(genre)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div className="form-row">
                    <select
                      onChange={handleCategoryChange}
                      className="form-select"
                      value=""
                    >
                      <option value="" disabled>Оберіть категорію</option>
                      {categories.map(category => (
                        <option key={category._id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-items">
                    {selectedCategories.map(category => (
                      <div key={category} className="selected-item">
                        <span>{category}</span>
                        <button type="button" onClick={() => removeCategory(category)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPosterFile)}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, setTrailerFile)}
                    className="form-input"
                  />
                </div>
                
                {newMovie.type === 'movie' && (
                  <div className="form-group">
                    <label className="form-label">Відео</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, setVideoFile)}
                      className="form-input"
                    />
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={newMovie["pricing.isFree"]}
                      onChange={(e) => setNewMovie({...newMovie, "pricing.isFree": e.target.checked})}
                    />
                    <label htmlFor="isFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                  
                  {!newMovie["pricing.isFree"] && (
                    <div className="form-group">
                      <label className="form-label">Ціна (грн)</label>
                      <input
                        type="number"
                        value={newMovie["pricing.buyPrice"]}
                        onChange={(e) => setNewMovie({...newMovie, "pricing.buyPrice": e.target.value})}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Секція для сезонів та епізодів (тільки для серіалів) */}
                {newMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      onClick={addSeason}
                      className="btn btn-secondary add-season-btn"
                    >
                      + Додати сезон
                    </button>
                    
                    {seasons.map((season, seasonIndex) => (
                      <div key={seasonIndex} className="season-card">
                        <div className="season-header">
                          <h4>Сезон {season.seasonNumber}</h4>
                          <button 
                            type="button" 
                            onClick={() => removeSeason(seasonIndex)}
                            className="btn btn-danger btn-sm"
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label>Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                  placeholder="Назва епізоду"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  className="form-textarea"
                                  placeholder="Опис епізоду"
                                  rows="2"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    className="form-input"
                                    min="1"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label>Відео</label>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleEpisodeFileChange(seasonIndex, episodeIndex, e)}
                                    className="form-input"
                                  />
                                  {episode.videoFileName && (
                                    <div className="current-file">
                                      Обрано: {episode.videoFileName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button 
                            type="button" 
                            onClick={() => addEpisode(seasonIndex)}
                            className="btn btn-secondary btn-sm add-episode-btn"
                          >
                            + Додати епізод
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {seasons.length === 0 && (
                      <div className="input-hint">
                        Додайте хоча б один сезон для серіалу
                      </div>
                    )}
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

      {/* Модальне вікно для редагування фільму */}
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
                    rows="4"
                    required
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={editingMovie.type}
                      onChange={(e) => {
                        setEditingMovie({...editingMovie, type: e.target.value});
                        if (e.target.value !== 'series') {
                          setSeasons([]);
                        }
                      }}
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
                      onChange={(e) => setEditingMovie({...editingMovie, releaseYear: e.target.value})}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв)</label>
                    <input
                      type="number"
                      value={editingMovie.duration}
                      onChange={(e) => setEditingMovie({...editingMovie, duration: e.target.value})}
                      min="1"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={editingMovie.ageRating}
                      onChange={(e) => setEditingMovie({...editingMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G (без обмежень)</option>
                      <option value="PG">PG (рекомендовано з батьками)</option>
                      <option value="PG-13">PG-13 (від 13 років)</option>
                      <option value="R">R (до 17 з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={editingMovie.country}
                      onChange={(e) => setEditingMovie({...editingMovie, country: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <input
                      type="text"
                      value={editingMovie.film_language}
                      onChange={(e) => setEditingMovie({...editingMovie, film_language: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Режисер</label>
                  <input
                    type="text"
                    value={editingMovie.director}
                    onChange={(e) => setEditingMovie({...editingMovie, director: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingMovie.cast) ? editingMovie.cast.join(', ') : editingMovie.cast}
                    onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value})}
                    className="form-input"
                    placeholder="Актор 1, Актор 2, Актор 3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div className="form-row">
                    <select
                      onChange={handleGenreChange}
                      className="form-select"
                      value=""
                    >
                      <option value="" disabled>Оберіть жанр</option>
                      {genres.map(genre => (
                        <option key={genre._id} value={genre.name}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-items">
                    {selectedGenres.map(genre => (
                      <div key={genre} className="selected-item">
                        <span>{genre}</span>
                        <button type="button" onClick={() => removeGenre(genre)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div className="form-row">
                    <select
                      onChange={handleCategoryChange}
                      className="form-select"
                      value=""
                    >
                      <option value="" disabled>Оберіть категорію</option>
                      {categories.map(category => (
                        <option key={category._id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-items">
                    {selectedCategories.map(category => (
                      <div key={category} className="selected-item">
                        <span>{category}</span>
                        <button type="button" onClick={() => removeCategory(category)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер</label>
                  {editingMovie.posterImage && (
                    <div className="current-image">
                      <img 
                        src={editingMovie.posterImage} 
                        alt="Current poster" 
                        style={{ width: '100px', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPosterFile)}
                    className="form-input"
                  />
                  <div className="input-hint">
                    Залиште порожнім, щоб зберегти поточний постер
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  {editingMovie.trailerUrl && (
                    <div className="current-file">
                      Поточний трейлер: {editingMovie.trailerUrl.split('/').pop()}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, setTrailerFile)}
                    className="form-input"
                  />
                  <div className="input-hint">
                    Залиште порожнім, щоб зберегти поточний трейлер
                  </div>
                </div>
                
                {editingMovie.type === 'movie' && (
                  <div className="form-group">
                    <label className="form-label">Відео</label>
                    {editingMovie.videoUrl && (
                      <div className="current-file">
                        Поточне відео: {editingMovie.videoUrl.split('/').pop()}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, setVideoFile)}
                      className="form-input"
                    />
                    <div className="input-hint">
                      Залиште порожнім, щоб зберегти поточне відео
                    </div>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="editIsFree"
                      checked={editingMovie.pricing?.isFree}
                      onChange={(e) => setEditingMovie({
                        ...editingMovie, 
                        pricing: {
                          ...editingMovie.pricing,
                          isFree: e.target.checked
                        }
                      })}
                    />
                    <label htmlFor="editIsFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                  
                  {!editingMovie.pricing?.isFree && (
                    <div className="form-group">
                      <label className="form-label">Ціна (грн)</label>
                      <input
                        type="number"
                        value={editingMovie.pricing?.buyPrice}
                        onChange={(e) => setEditingMovie({
                          ...editingMovie, 
                          pricing: {
                            ...editingMovie.pricing,
                            buyPrice: e.target.value
                          }
                        })}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Секція для сезонів та епізодів (тільки для серіалів) */}
                {editingMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      onClick={addSeason}
                      className="btn btn-secondary add-season-btn"
                    >
                      + Додати сезон
                    </button>
                    
                    {seasons.map((season, seasonIndex) => (
                      <div key={seasonIndex} className="season-card">
                        <div className="season-header">
                          <h4>Сезон {season.seasonNumber}</h4>
                          <button 
                            type="button" 
                            onClick={() => removeSeason(seasonIndex)}
                            className="btn btn-danger btn-sm"
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label>Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                  placeholder="Назва епізоду"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  className="form-textarea"
                                  placeholder="Опис епізоду"
                                  rows="2"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    className="form-input"
                                    min="1"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label>Відео</label>
                                  {episode.videoUrl && (
                                    <div className="current-file">
                                      Поточне відео: {episode.videoUrl.split('/').pop()}
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleEpisodeFileChange(seasonIndex, episodeIndex, e)}
                                    className="form-input"
                                  />
                                  {episode.videoFileName && (
                                    <div className="current-file">
                                      Обрано: {episode.videoFileName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button 
                            type="button" 
                            onClick={() => addEpisode(seasonIndex)}
                            className="btn btn-secondary btn-sm add-episode-btn"
                          >
                            + Додати епізод
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {seasons.length === 0 && (
                      <div className="input-hint">
                        Додайте хоча б один сезон для серіалу
                      </div>
                    )}
                  </div>
                )}
                
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