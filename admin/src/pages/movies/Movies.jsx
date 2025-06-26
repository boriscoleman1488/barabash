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
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseYear: "",
    duration: "",
    type: "movie",
    film_language: "",
    country: "",
    director: "",
    cast: [],
    ageRating: "PG",
    pricing: {
      buyPrice: "0",
      isFree: "true"
    },
    posterImage: null,
    trailerUrl: null,
    videoUrl: null
  });
  const [seasons, setSeasons] = useState([]);

  // Список мов для вибору
  const languages = [
    { code: "uk", name: "Українська" },
    { code: "en", name: "Англійська" },
    { code: "pl", name: "Польська" },
    { code: "de", name: "Німецька" },
    { code: "fr", name: "Французька" },
    { code: "es", name: "Іспанська" },
    { code: "it", name: "Італійська" },
    { code: "ja", name: "Японська" },
    { code: "ko", name: "Корейська" },
    { code: "zh", name: "Китайська" },
    { code: "ru", name: "Російська" },
    { code: "ar", name: "Арабська" },
    { code: "hi", name: "Гінді" },
    { code: "pt", name: "Португальська" },
    { code: "tr", name: "Турецька" }
  ];

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
      // Створюємо FormData для відправки файлів
      const formData = new FormData();
      
      // Додаємо текстові поля
      formData.append('title', newMovie.title);
      formData.append('description', newMovie.description);
      formData.append('releaseYear', newMovie.releaseYear);
      formData.append('duration', newMovie.duration);
      formData.append('type', newMovie.type);
      formData.append('film_language', newMovie.film_language);
      formData.append('country', newMovie.country);
      formData.append('director', newMovie.director);
      
      // Додаємо масив акторів
      if (typeof newMovie.cast === 'string') {
        formData.append('cast', newMovie.cast);
      } else if (Array.isArray(newMovie.cast)) {
        formData.append('cast', newMovie.cast.join(','));
      }
      
      formData.append('ageRating', newMovie.ageRating);
      
      // Додаємо ціноутворення
      formData.append('pricing.buyPrice', newMovie.pricing.buyPrice);
      formData.append('pricing.isFree', newMovie.pricing.isFree);
      
      // Додаємо жанри та категорії
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('categories', JSON.stringify(selectedCategories));
      
      // Додаємо файли, якщо вони є
      if (newMovie.posterImage) {
        formData.append('posterImage', newMovie.posterImage);
      }
      if (newMovie.trailerUrl) {
        formData.append('trailerUrl', newMovie.trailerUrl);
      }
      if (newMovie.videoUrl) {
        formData.append('videoUrl', newMovie.videoUrl);
      }
      
      // Додаємо сезони для серіалів
      if (newMovie.type === 'series' && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
      }
      
      const data = await movieAPI.createWithFiles(formData);
      
      if (data.success) {
        setShowCreateModal(false);
        resetNewMovieForm();
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
      // Створюємо FormData для відправки файлів
      const formData = new FormData();
      
      // Додаємо текстові поля
      formData.append('title', editingMovie.title);
      formData.append('description', editingMovie.description);
      formData.append('releaseYear', editingMovie.releaseYear);
      formData.append('duration', editingMovie.duration);
      formData.append('type', editingMovie.type);
      formData.append('film_language', editingMovie.film_language || '');
      formData.append('country', editingMovie.country || '');
      formData.append('director', editingMovie.director || '');
      
      // Додаємо масив акторів
      if (typeof editingMovie.cast === 'string') {
        formData.append('cast', editingMovie.cast);
      } else if (Array.isArray(editingMovie.cast)) {
        formData.append('cast', editingMovie.cast.join(','));
      }
      
      formData.append('ageRating', editingMovie.ageRating);
      
      // Додаємо ціноутворення
      if (editingMovie.pricing) {
        formData.append('pricing.buyPrice', editingMovie.pricing.buyPrice);
        formData.append('pricing.isFree', editingMovie.pricing.isFree);
      }
      
      // Додаємо жанри та категорії
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('categories', JSON.stringify(selectedCategories));
      
      // Додаємо файли, якщо вони є
      if (editingMovie.newPosterImage) {
        formData.append('posterImage', editingMovie.newPosterImage);
      }
      if (editingMovie.newTrailerUrl) {
        formData.append('trailerUrl', editingMovie.newTrailerUrl);
      }
      if (editingMovie.newVideoUrl) {
        formData.append('videoUrl', editingMovie.newVideoUrl);
      }
      
      // Додаємо сезони для серіалів
      if (editingMovie.type === 'series' && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
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

  const resetNewMovieForm = () => {
    setNewMovie({
      title: "",
      description: "",
      releaseYear: "",
      duration: "",
      type: "movie",
      film_language: "",
      country: "",
      director: "",
      cast: [],
      ageRating: "PG",
      pricing: {
        buyPrice: "0",
        isFree: "true"
      },
      posterImage: null,
      trailerUrl: null,
      videoUrl: null
    });
    setSelectedGenres([]);
    setSelectedCategories([]);
    setSeasons([]);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (showCreateModal) {
        setNewMovie(prev => ({
          ...prev,
          [field]: file
        }));
      } else if (showEditModal) {
        setEditingMovie(prev => ({
          ...prev,
          [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: file
        }));
      }
    }
  };

  const handleAddSeason = () => {
    setSeasons(prev => [...prev, {
      seasonNumber: prev.length + 1,
      episodes: []
    }]);
  };

  const handleRemoveSeason = (index) => {
    setSeasons(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddEpisode = (seasonIndex) => {
    setSeasons(prev => {
      const newSeasons = [...prev];
      const season = newSeasons[seasonIndex];
      season.episodes = [
        ...season.episodes,
        {
          episodeNumber: season.episodes.length + 1,
          title: "",
          description: "",
          duration: "",
          videoUrl: ""
        }
      ];
      return newSeasons;
    });
  };

  const handleRemoveEpisode = (seasonIndex, episodeIndex) => {
    setSeasons(prev => {
      const newSeasons = [...prev];
      newSeasons[seasonIndex].episodes = newSeasons[seasonIndex].episodes.filter((_, i) => i !== episodeIndex);
      return newSeasons;
    });
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {
    setSeasons(prev => {
      const newSeasons = [...prev];
      newSeasons[seasonIndex].episodes[episodeIndex][field] = value;
      return newSeasons;
    });
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showEditModal && editingMovie) {
      // Встановлюємо вибрані жанри та категорії при редагуванні
      const genreIds = editingMovie.genres?.map(g => g._id) || [];
      const categoryIds = editingMovie.categories?.map(c => c._id) || [];
      
      setSelectedGenres(genreIds);
      setSelectedCategories(categoryIds);
      
      // Встановлюємо сезони для серіалів
      if (editingMovie.type === 'series' && editingMovie.seasons) {
        setSeasons(editingMovie.seasons);
      } else {
        setSeasons([]);
      }
    }
  }, [showEditModal, editingMovie]);

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
              resetNewMovieForm();
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
                  {filteredMovies.map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        {movie.posterImage ? (
                          <img 
                            src={movie.posterImage} 
                            alt={movie.title}
                            style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '60px', height: '90px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Немає
                          </div>
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {movie.genres?.slice(0, 2).map((genre, index) => (
                            <span key={index} className="badge badge-secondary">
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres?.length > 2 && (
                            <span className="badge badge-secondary">+{movie.genres.length - 2}</span>
                          )}
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
                            onClick={() => {
                              setEditingMovie({ ...movie });
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
              <form onSubmit={handleCreateMovie} encType="multipart/form-data">
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
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      value={newMovie.releaseYear}
                      onChange={(e) => setNewMovie({...newMovie, releaseYear: e.target.value})}
                      required
                      min="1900"
                      max="2099"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв) *</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                      required
                      min="1"
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
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={newMovie.ageRating}
                      onChange={(e) => setNewMovie({...newMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське керівництво)</option>
                      <option value="PG-13">PG-13 (не рекомендовано дітям до 13)</option>
                      <option value="R">R (обмежено, до 17 з дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <select
                      value={newMovie.film_language}
                      onChange={(e) => setNewMovie({...newMovie, film_language: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Оберіть мову</option>
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
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
                    value={Array.isArray(newMovie.cast) ? newMovie.cast.join(', ') : newMovie.cast}
                    onChange={(e) => setNewMovie({...newMovie, cast: e.target.value.split(',').map(item => item.trim())})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {genres.map(genre => (
                      <label key={genre._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: selectedGenres.includes(genre._id) ? '#e3f2fd' : '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre._id)}
                          onChange={() => handleGenreChange(genre._id)}
                        />
                        {genre.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {categories.map(category => (
                      <label key={category._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: selectedCategories.includes(category._id) ? '#e3f2fd' : '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'posterImage')}
                    required
                    className="form-input"
                  />
                  <div className="input-hint">Рекомендований розмір: 500x750px, формат: JPG, PNG</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'trailerUrl')}
                    className="form-input"
                  />
                  <div className="input-hint">Формат: MP4, WebM, максимальний розмір: 100MB</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Відео</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'videoUrl')}
                    className="form-input"
                  />
                  <div className="input-hint">Формат: MP4, WebM, максимальний розмір: 500MB</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        checked={newMovie.pricing.isFree === "true"}
                        onChange={() => setNewMovie({...newMovie, pricing: {...newMovie.pricing, isFree: "true"}})}
                      />
                      Безкоштовно
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        checked={newMovie.pricing.isFree === "false"}
                        onChange={() => setNewMovie({...newMovie, pricing: {...newMovie.pricing, isFree: "false"}})}
                      />
                      Платно
                    </label>
                  </div>
                  
                  {newMovie.pricing.isFree === "false" && (
                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label">Ціна (грн)</label>
                      <input
                        type="number"
                        value={newMovie.pricing.buyPrice}
                        onChange={(e) => setNewMovie({...newMovie, pricing: {...newMovie.pricing, buyPrice: e.target.value}})}
                        min="1"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Секція для серіалів */}
                {newMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    <button 
                      type="button" 
                      onClick={handleAddSeason}
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
                            onClick={() => handleRemoveSeason(seasonIndex)}
                            className="btn btn-danger btn-sm"
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          <button 
                            type="button" 
                            onClick={() => handleAddEpisode(seasonIndex)}
                            className="btn btn-secondary btn-sm add-episode-btn"
                          >
                            + Додати епізод
                          </button>
                          
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveEpisode(seasonIndex, episodeIndex)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео URL</label>
                                  <input
                                    type="text"
                                    value={episode.videoUrl}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'videoUrl', e.target.value)}
                                    className="form-input"
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
                    Створити фільм
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
              <form onSubmit={handleEditMovie} encType="multipart/form-data">
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
                    <label className="form-label">Рік випуску *</label>
                    <input
                      type="number"
                      value={editingMovie.releaseYear}
                      onChange={(e) => setEditingMovie({...editingMovie, releaseYear: e.target.value})}
                      required
                      min="1900"
                      max="2099"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв) *</label>
                    <input
                      type="number"
                      value={editingMovie.duration}
                      onChange={(e) => setEditingMovie({...editingMovie, duration: e.target.value})}
                      required
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Тип</label>
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
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={editingMovie.ageRating}
                      onChange={(e) => setEditingMovie({...editingMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське керівництво)</option>
                      <option value="PG-13">PG-13 (не рекомендовано дітям до 13)</option>
                      <option value="R">R (обмежено, до 17 з дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <select
                      value={editingMovie.film_language || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, film_language: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Оберіть мову</option>
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Країна</label>
                    <input
                      type="text"
                      value={editingMovie.country || ''}
                      onChange={(e) => setEditingMovie({...editingMovie, country: e.target.value})}
                      className="form-input"
                    />
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
                    value={Array.isArray(editingMovie.cast) ? editingMovie.cast.join(', ') : editingMovie.cast || ''}
                    onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value.split(',').map(item => item.trim())})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {genres.map(genre => (
                      <label key={genre._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: selectedGenres.includes(genre._id) ? '#e3f2fd' : '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre._id)}
                          onChange={() => handleGenreChange(genre._id)}
                        />
                        {genre.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {categories.map(category => (
                      <label key={category._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: selectedCategories.includes(category._id) ? '#e3f2fd' : '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'posterImage')}
                    className="form-input"
                  />
                  {editingMovie.posterImage && (
                    <div className="current-file">
                      Поточний постер: <a href={editingMovie.posterImage} target="_blank" rel="noopener noreferrer">Переглянути</a>
                    </div>
                  )}
                  <div className="input-hint">Рекомендований розмір: 500x750px, формат: JPG, PNG</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'trailerUrl')}
                    className="form-input"
                  />
                  {editingMovie.trailerUrl && (
                    <div className="current-file">
                      Поточний трейлер: <a href={editingMovie.trailerUrl} target="_blank" rel="noopener noreferrer">Переглянути</a>
                    </div>
                  )}
                  <div className="input-hint">Формат: MP4, WebM, максимальний розмір: 100MB</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Відео</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'videoUrl')}
                    className="form-input"
                  />
                  {editingMovie.videoUrl && (
                    <div className="current-file">
                      Поточне відео: <a href={editingMovie.videoUrl} target="_blank" rel="noopener noreferrer">Переглянути</a>
                    </div>
                  )}
                  <div className="input-hint">Формат: MP4, WebM, максимальний розмір: 500MB</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        checked={editingMovie.pricing?.isFree === true || editingMovie.pricing?.isFree === "true"}
                        onChange={() => setEditingMovie({...editingMovie, pricing: {...editingMovie.pricing, isFree: "true"}})}
                      />
                      Безкоштовно
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        checked={editingMovie.pricing?.isFree === false || editingMovie.pricing?.isFree === "false"}
                        onChange={() => setEditingMovie({...editingMovie, pricing: {...editingMovie.pricing, isFree: "false"}})}
                      />
                      Платно
                    </label>
                  </div>
                  
                  {(editingMovie.pricing?.isFree === false || editingMovie.pricing?.isFree === "false") && (
                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label">Ціна (грн)</label>
                      <input
                        type="number"
                        value={editingMovie.pricing?.buyPrice || 0}
                        onChange={(e) => setEditingMovie({...editingMovie, pricing: {...editingMovie.pricing, buyPrice: e.target.value}})}
                        min="1"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Секція для серіалів */}
                {editingMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    <button 
                      type="button" 
                      onClick={handleAddSeason}
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
                            onClick={() => handleRemoveSeason(seasonIndex)}
                            className="btn btn-danger btn-sm"
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          <button 
                            type="button" 
                            onClick={() => handleAddEpisode(seasonIndex)}
                            className="btn btn-secondary btn-sm add-episode-btn"
                          >
                            + Додати епізод
                          </button>
                          
                          {season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveEpisode(seasonIndex, episodeIndex)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео URL</label>
                                  <input
                                    type="text"
                                    value={episode.videoUrl}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'videoUrl', e.target.value)}
                                    className="form-input"
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