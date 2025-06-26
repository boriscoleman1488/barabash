import React, { useState, useEffect } from "react";
import { movieAPI } from "../../api/movieAPI";
import { genreAPI } from "../../api/genreAPI";
import { categoryAPI } from "../../api/categoryAPI";
import "../../styles/admin-common.css";

export default function Movies() {
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
    posterImage: null,
    trailerUrl: "",
    videoUrl: null,
    duration: "",
    releaseYear: new Date().getFullYear(),
    country: "",
    film_language: "",
    ageRating: "PG",
    genres: [],
    director: "",
    cast: "",
    type: "movie",
    seasons: [],
    pricing: {
      buyPrice: 0,
      isFree: true
    }
  });
  const [posterPreview, setPosterPreview] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

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

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll(1, 100);
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
      
      // Додаємо основні поля
      Object.keys(newMovie).forEach(key => {
        if (key !== 'posterImage' && key !== 'videoUrl' && key !== 'trailerUrl' && key !== 'seasons' && key !== 'pricing') {
          formData.append(key, newMovie[key]);
        }
      });
      
      // Додаємо файли
      if (newMovie.posterImage) {
        formData.append('posterImage', newMovie.posterImage);
      }
      
      if (newMovie.videoUrl && newMovie.type === 'movie') {
        formData.append('videoUrl', newMovie.videoUrl);
      }
      
      if (newMovie.trailerUrl) {
        formData.append('trailerUrl', newMovie.trailerUrl);
      }
      
      // Додаємо жанри та категорії
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('categories', JSON.stringify(selectedCategories));
      
      // Додаємо ціноутворення
      formData.append('pricing.buyPrice', newMovie.pricing.buyPrice);
      formData.append('pricing.isFree', newMovie.pricing.isFree);
      
      // Додаємо акторів
      if (typeof newMovie.cast === 'string') {
        formData.append('cast', newMovie.cast);
      } else if (Array.isArray(newMovie.cast)) {
        formData.append('cast', newMovie.cast.join(','));
      }
      
      // Додаємо сезони для серіалів
      if (newMovie.type === 'series' && newMovie.seasons.length > 0) {
        formData.append('seasons', JSON.stringify(newMovie.seasons));
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
      
      // Додаємо основні поля
      Object.keys(editingMovie).forEach(key => {
        if (key !== 'posterImage' && key !== 'videoUrl' && key !== 'trailerUrl' && key !== 'seasons' && key !== 'pricing' && key !== '_id') {
          formData.append(key, editingMovie[key]);
        }
      });
      
      // Додаємо файли, тільки якщо вони були змінені
      if (editingMovie.posterImage && typeof editingMovie.posterImage !== 'string') {
        formData.append('posterImage', editingMovie.posterImage);
      }
      
      if (editingMovie.videoUrl && typeof editingMovie.videoUrl !== 'string' && editingMovie.type === 'movie') {
        formData.append('videoUrl', editingMovie.videoUrl);
      }
      
      if (editingMovie.trailerUrl && typeof editingMovie.trailerUrl !== 'string') {
        formData.append('trailerUrl', editingMovie.trailerUrl);
      }
      
      // Додаємо жанри та категорії
      const genreIds = editingMovie.genres.map(g => typeof g === 'object' ? g._id : g);
      const categoryIds = editingMovie.categories.map(c => typeof c === 'object' ? c._id : c);
      
      formData.append('genres', JSON.stringify(genreIds));
      formData.append('categories', JSON.stringify(categoryIds));
      
      // Додаємо ціноутворення
      formData.append('pricing.buyPrice', editingMovie.pricing.buyPrice);
      formData.append('pricing.isFree', editingMovie.pricing.isFree);
      
      // Додаємо акторів
      if (typeof editingMovie.cast === 'string') {
        formData.append('cast', editingMovie.cast);
      } else if (Array.isArray(editingMovie.cast)) {
        formData.append('cast', editingMovie.cast.join(','));
      }
      
      // Додаємо сезони для серіалів
      if (editingMovie.type === 'series' && editingMovie.seasons.length > 0) {
        formData.append('seasons', JSON.stringify(editingMovie.seasons));
      }
      
      const data = await movieAPI.updateWithFiles(editingMovie._id, formData);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingMovie(null);
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

  const handleFileChange = (e, field, setStateFunc) => {
    const file = e.target.files[0];
    if (file) {
      setStateFunc(prev => ({
        ...prev,
        [field]: file
      }));
      
      // Створюємо превью для зображення
      if (field === 'posterImage') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPosterPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTypeChange = (e, setStateFunc) => {
    const type = e.target.value;
    setStateFunc(prev => ({
      ...prev,
      type,
      // Якщо тип змінюється на фільм, очищаємо сезони
      ...(type === 'movie' ? { seasons: [] } : {})
    }));
  };

  const handlePricingChange = (e, field, setStateFunc) => {
    const value = field === 'isFree' ? e.target.checked : parseFloat(e.target.value);
    setStateFunc(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleGenreChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedGenres(options);
  };

  const handleCategoryChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategories(options);
  };

  const resetForm = () => {
    setNewMovie({
      title: "",
      description: "",
      posterImage: null,
      trailerUrl: "",
      videoUrl: null,
      duration: "",
      releaseYear: new Date().getFullYear(),
      country: "",
      film_language: "",
      ageRating: "PG",
      genres: [],
      director: "",
      cast: "",
      type: "movie",
      seasons: [],
      pricing: {
        buyPrice: 0,
        isFree: true
      }
    });
    setPosterPreview("");
    setSelectedGenres([]);
    setSelectedCategories([]);
  };

  const openEditModal = (movie) => {
    // Підготовка даних для редагування
    const genreIds = movie.genres.map(g => typeof g === 'object' ? g._id : g);
    const categoryIds = movie.categories.map(c => typeof c === 'object' ? c._id : c);
    
    setEditingMovie({
      ...movie,
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || ''
    });
    setSelectedGenres(genreIds);
    setSelectedCategories(categoryIds);
    setShowEditModal(true);
  };

  // Функції для роботи з сезонами та епізодами
  const addSeason = (setStateFunc) => {
    setStateFunc(prev => ({
      ...prev,
      seasons: [...prev.seasons, {
        seasonNumber: prev.seasons.length + 1,
        episodes: []
      }]
    }));
  };

  const removeSeason = (index, setStateFunc) => {
    setStateFunc(prev => {
      const newSeasons = [...prev.seasons];
      newSeasons.splice(index, 1);
      
      // Перенумеровуємо сезони
      return {
        ...prev,
        seasons: newSeasons.map((season, idx) => ({
          ...season,
          seasonNumber: idx + 1
        }))
      };
    });
  };

  const addEpisode = (seasonIndex, setStateFunc) => {
    setStateFunc(prev => {
      const newSeasons = [...prev.seasons];
      const episodes = newSeasons[seasonIndex].episodes || [];
      
      newSeasons[seasonIndex].episodes = [
        ...episodes,
        {
          episodeNumber: episodes.length + 1,
          title: "",
          description: "",
          duration: 0,
          videoUrl: ""
        }
      ];
      
      return {
        ...prev,
        seasons: newSeasons
      };
    });
  };

  const removeEpisode = (seasonIndex, episodeIndex, setStateFunc) => {
    setStateFunc(prev => {
      const newSeasons = [...prev.seasons];
      const episodes = [...newSeasons[seasonIndex].episodes];
      
      episodes.splice(episodeIndex, 1);
      
      // Перенумеровуємо епізоди
      newSeasons[seasonIndex].episodes = episodes.map((episode, idx) => ({
        ...episode,
        episodeNumber: idx + 1
      }));
      
      return {
        ...prev,
        seasons: newSeasons
      };
    });
  };

  const updateEpisode = (seasonIndex, episodeIndex, field, value, setStateFunc) => {
    setStateFunc(prev => {
      const newSeasons = [...prev.seasons];
      const episodes = [...newSeasons[seasonIndex].episodes];
      
      episodes[episodeIndex] = {
        ...episodes[episodeIndex],
        [field]: value
      };
      
      newSeasons[seasonIndex].episodes = episodes;
      
      return {
        ...prev,
        seasons: newSeasons
      };
    });
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
            onClick={() => setShowCreateModal(true)}
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
                        {movie.posterImage && (
                          <img 
                            src={movie.posterImage} 
                            alt={movie.title}
                            style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                      </td>
                      <td className="font-weight-bold">{movie.title}</td>
                      <td>
                        <span className={`badge ${movie.type === 'movie' ? 'badge-info' : 'badge-warning'}`}>
                          {movie.type === 'movie' ? 'Фільм' : 'Серіал'}
                        </span>
                      </td>
                      <td>{movie.releaseYear}</td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movie.genres.map(genre => 
                            typeof genre === 'object' ? genre.name : genre
                          ).join(', ')}
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
                    rows="3"
                    required
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип</label>
                    <select
                      value={newMovie.type}
                      onChange={(e) => handleTypeChange(e, setNewMovie)}
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
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри *</label>
                    <select
                      multiple
                      value={selectedGenres}
                      onChange={handleGenreChange}
                      className="form-select"
                      style={{ height: '120px' }}
                    >
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">Утримуйте Ctrl для вибору декількох жанрів</div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Категорії</label>
                    <select
                      multiple
                      value={selectedCategories}
                      onChange={handleCategoryChange}
                      className="form-select"
                      style={{ height: '120px' }}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name} ({category.type})
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">Утримуйте Ctrl для вибору декількох категорій</div>
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
                    <label className="form-label">Актори</label>
                    <input
                      type="text"
                      value={newMovie.cast}
                      onChange={(e) => setNewMovie({...newMovie, cast: e.target.value})}
                      className="form-input"
                      placeholder="Через кому: Актор 1, Актор 2, ..."
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Постер *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'posterImage', setNewMovie)}
                      required
                      className="form-input"
                    />
                    {posterPreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={posterPreview} 
                          alt="Превью постера" 
                          style={{ maxWidth: '100px', maxHeight: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Трейлер (URL)</label>
                    <input
                      type="text"
                      value={newMovie.trailerUrl}
                      onChange={(e) => setNewMovie({...newMovie, trailerUrl: e.target.value})}
                      className="form-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                
                {newMovie.type === 'movie' && (
                  <div className="form-group">
                    <label className="form-label">Відео файл</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'videoUrl', setNewMovie)}
                      className="form-input"
                    />
                    <div className="input-hint">Підтримувані формати: MP4, WebM, MOV</div>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ціна (грн)</label>
                    <input
                      type="number"
                      value={newMovie.pricing.buyPrice}
                      onChange={(e) => handlePricingChange(e, 'buyPrice', setNewMovie)}
                      min="0"
                      step="0.01"
                      className="form-input"
                      disabled={newMovie.pricing.isFree}
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={newMovie.pricing.isFree}
                      onChange={(e) => handlePricingChange(e, 'isFree', setNewMovie)}
                    />
                    <label htmlFor="isFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                </div>
                
                {/* Секція для серіалів */}
                {newMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      className="btn btn-primary add-season-btn"
                      onClick={() => addSeason(setNewMovie)}
                    >
                      + Додати сезон
                    </button>
                    
                    {newMovie.seasons.map((season, seasonIndex) => (
                      <div key={seasonIndex} className="season-card">
                        <div className="season-header">
                          <h4>Сезон {season.seasonNumber}</h4>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm"
                            onClick={() => removeSeason(seasonIndex, setNewMovie)}
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          <button 
                            type="button" 
                            className="btn btn-secondary add-episode-btn"
                            onClick={() => addEpisode(seasonIndex, setNewMovie)}
                          >
                            + Додати епізод
                          </button>
                          
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm remove-btn"
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex, setNewMovie)}
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'title', e.target.value, setNewMovie)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'description', e.target.value, setNewMovie)}
                                  className="form-textarea"
                                  rows="2"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'duration', e.target.value, setNewMovie)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео URL</label>
                                  <input
                                    type="text"
                                    value={episode.videoUrl}
                                    onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'videoUrl', e.target.value, setNewMovie)}
                                    className="form-input"
                                    placeholder="https://example.com/video.mp4"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
                    rows="3"
                    required
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип</label>
                    <select
                      value={editingMovie.type}
                      onChange={(e) => handleTypeChange(e, setEditingMovie)}
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
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри *</label>
                    <select
                      multiple
                      value={selectedGenres}
                      onChange={handleGenreChange}
                      className="form-select"
                      style={{ height: '120px' }}
                    >
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">Утримуйте Ctrl для вибору декількох жанрів</div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Категорії</label>
                    <select
                      multiple
                      value={selectedCategories}
                      onChange={handleCategoryChange}
                      className="form-select"
                      style={{ height: '120px' }}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name} ({category.type})
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">Утримуйте Ctrl для вибору декількох категорій</div>
                  </div>
                </div>
                
                <div className="form-row">
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
                    <label className="form-label">Актори</label>
                    <input
                      type="text"
                      value={editingMovie.cast}
                      onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value})}
                      className="form-input"
                      placeholder="Через кому: Актор 1, Актор 2, ..."
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Постер</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'posterImage', setEditingMovie)}
                      className="form-input"
                    />
                    {editingMovie.posterImage && typeof editingMovie.posterImage === 'string' && (
                      <div className="current-file">
                        <span>Поточний постер:</span>
                        <img 
                          src={editingMovie.posterImage} 
                          alt="Поточний постер" 
                          style={{ maxWidth: '100px', maxHeight: '150px', objectFit: 'cover', marginTop: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Трейлер (URL)</label>
                    <input
                      type="text"
                      value={editingMovie.trailerUrl}
                      onChange={(e) => setEditingMovie({...editingMovie, trailerUrl: e.target.value})}
                      className="form-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                
                {editingMovie.type === 'movie' && (
                  <div className="form-group">
                    <label className="form-label">Відео файл</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'videoUrl', setEditingMovie)}
                      className="form-input"
                    />
                    {editingMovie.videoUrl && typeof editingMovie.videoUrl === 'string' && (
                      <div className="current-file">
                        <span>Поточне відео: {editingMovie.videoUrl.split('/').pop()}</span>
                      </div>
                    )}
                    <div className="input-hint">Підтримувані формати: MP4, WebM, MOV</div>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ціна (грн)</label>
                    <input
                      type="number"
                      value={editingMovie.pricing.buyPrice}
                      onChange={(e) => handlePricingChange(e, 'buyPrice', setEditingMovie)}
                      min="0"
                      step="0.01"
                      className="form-input"
                      disabled={editingMovie.pricing.isFree}
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="editIsFree"
                      checked={editingMovie.pricing.isFree}
                      onChange={(e) => handlePricingChange(e, 'isFree', setEditingMovie)}
                    />
                    <label htmlFor="editIsFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                </div>
                
                {/* Секція для серіалів */}
                {editingMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      className="btn btn-primary add-season-btn"
                      onClick={() => addSeason(setEditingMovie)}
                    >
                      + Додати сезон
                    </button>
                    
                    {editingMovie.seasons.map((season, seasonIndex) => (
                      <div key={seasonIndex} className="season-card">
                        <div className="season-header">
                          <h4>Сезон {season.seasonNumber}</h4>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm"
                            onClick={() => removeSeason(seasonIndex, setEditingMovie)}
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          <button 
                            type="button" 
                            className="btn btn-secondary add-episode-btn"
                            onClick={() => addEpisode(seasonIndex, setEditingMovie)}
                          >
                            + Додати епізод
                          </button>
                          
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm remove-btn"
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex, setEditingMovie)}
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'title', e.target.value, setEditingMovie)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'description', e.target.value, setEditingMovie)}
                                  className="form-textarea"
                                  rows="2"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'duration', e.target.value, setEditingMovie)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео URL</label>
                                  <input
                                    type="text"
                                    value={episode.videoUrl}
                                    onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'videoUrl', e.target.value, setEditingMovie)}
                                    className="form-input"
                                    placeholder="https://example.com/video.mp4"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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