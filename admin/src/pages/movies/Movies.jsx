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
  const [posterPreview, setPosterPreview] = useState(null);
  
  // Стан для нового фільму
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    duration: "",
    type: "movie",
    film_language: "",
    country: "",
    director: "",
    cast: [],
    ageRating: "PG",
    pricing: {
      buyPrice: 0,
      isFree: true
    },
    genres: [],
    categories: [],
    seasons: []
  });

  // Стан для файлів
  const [movieFiles, setMovieFiles] = useState({
    posterImage: null,
    trailerUrl: null,
    videoUrl: null
  });

  // Стан для файлів епізодів
  const [episodeFiles, setEpisodeFiles] = useState({});

  // Список мов для вибору
  const languages = [
    { code: "uk", name: "Українська" },
    { code: "en", name: "Англійська" },
    { code: "pl", name: "Польська" },
    { code: "de", name: "Німецька" },
    { code: "fr", name: "Французька" },
    { code: "es", name: "Іспанська" },
    { code: "it", name: "Італійська" },
    { code: "ru", name: "Російська" },
    { code: "ja", name: "Японська" },
    { code: "zh", name: "Китайська" },
    { code: "ko", name: "Корейська" },
    { code: "ar", name: "Арабська" },
    { code: "hi", name: "Хінді" }
  ];

  const fetchMovies = async (page = 1) => {
    try {
      setLoading(true);
      const data = await movieAPI.getAll(page, 10);
      
      if (data.success) {
        setMovies(data.movies);
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
        setGenres(data.genres);
      }
    } catch (err) {
      console.error('Fetch genres error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll(1, 100);
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchGenres();
    fetchCategories();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    
    try {
      // Створюємо FormData для відправки файлів
      const formData = new FormData();
      
      // Додаємо основні дані фільму
      Object.keys(newMovie).forEach(key => {
        if (key === 'pricing') {
          formData.append('pricing[buyPrice]', newMovie.pricing.buyPrice);
          formData.append('pricing[isFree]', newMovie.pricing.isFree);
        } else if (key === 'cast') {
          formData.append('cast', JSON.stringify(newMovie.cast));
        } else if (key === 'genres') {
          formData.append('genres', JSON.stringify(newMovie.genres));
        } else if (key === 'categories') {
          formData.append('categories', JSON.stringify(newMovie.categories));
        } else if (key === 'seasons' && newMovie.type === 'series') {
          // Обробка сезонів для серіалів
          formData.append('seasons', JSON.stringify(newMovie.seasons));
        } else {
          formData.append(key, newMovie[key]);
        }
      });
      
      // Додаємо файли
      if (movieFiles.posterImage) {
        formData.append('posterImage', movieFiles.posterImage);
      }
      if (movieFiles.trailerUrl) {
        formData.append('trailerUrl', movieFiles.trailerUrl);
      }
      if (movieFiles.videoUrl) {
        formData.append('videoUrl', movieFiles.videoUrl);
      }
      
      // Додаємо файли епізодів
      Object.keys(episodeFiles).forEach(key => {
        if (episodeFiles[key]) {
          formData.append(key, episodeFiles[key]);
        }
      });
      
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
      // Аналогічно до створення, але для редагування
      const formData = new FormData();
      
      Object.keys(editingMovie).forEach(key => {
        if (key === 'pricing') {
          formData.append('pricing[buyPrice]', editingMovie.pricing.buyPrice);
          formData.append('pricing[isFree]', editingMovie.pricing.isFree);
        } else if (key === 'cast') {
          formData.append('cast', JSON.stringify(editingMovie.cast));
        } else if (key === 'genres') {
          formData.append('genres', JSON.stringify(editingMovie.genres));
        } else if (key === 'categories') {
          formData.append('categories', JSON.stringify(editingMovie.categories));
        } else if (key === 'seasons' && editingMovie.type === 'series') {
          formData.append('seasons', JSON.stringify(editingMovie.seasons));
        } else if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, editingMovie[key]);
        }
      });
      
      // Додаємо файли
      if (movieFiles.posterImage) {
        formData.append('posterImage', movieFiles.posterImage);
      }
      if (movieFiles.trailerUrl) {
        formData.append('trailerUrl', movieFiles.trailerUrl);
      }
      if (movieFiles.videoUrl) {
        formData.append('videoUrl', movieFiles.videoUrl);
      }
      
      // Додаємо файли епізодів
      Object.keys(episodeFiles).forEach(key => {
        if (episodeFiles[key]) {
          formData.append(key, episodeFiles[key]);
        }
      });
      
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

  const resetForm = () => {
    setNewMovie({
      title: "",
      description: "",
      releaseYear: new Date().getFullYear(),
      duration: "",
      type: "movie",
      film_language: "",
      country: "",
      director: "",
      cast: [],
      ageRating: "PG",
      pricing: {
        buyPrice: 0,
        isFree: true
      },
      genres: [],
      categories: [],
      seasons: []
    });
    setMovieFiles({
      posterImage: null,
      trailerUrl: null,
      videoUrl: null
    });
    setEpisodeFiles({});
    setPosterPreview(null);
  };

  const handleInputChange = (e, isEditMode = false) => {
    const { name, value, type, checked } = e.target;
    
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1];
      updateState({
        ...currentState,
        pricing: {
          ...currentState.pricing,
          [pricingField]: type === 'checkbox' ? checked : value
        }
      });
    } else if (name === 'cast') {
      // Обробка акторів як масиву
      const castArray = value.split(',').map(item => item.trim()).filter(item => item);
      updateState({
        ...currentState,
        cast: castArray
      });
    } else {
      updateState({
        ...currentState,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleFileChange = (e, isEditMode = false) => {
    const { name, files } = e.target;
    
    // Якщо це файл для епізоду
    if (name.startsWith('episode_')) {
      const episodeKey = name;
      setEpisodeFiles(prev => ({
        ...prev,
        [episodeKey]: files[0]
      }));
      return;
    }
    
    // Інакше це файл для фільму
    setMovieFiles(prev => ({
      ...prev,
      [name]: files[0]
    }));
    
    // Створюємо превью для постера
    if (name === 'posterImage' && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleGenreChange = (e, isEditMode = false) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    
    if (isEditMode) {
      setEditingMovie(prev => ({
        ...prev,
        genres: selectedOptions
      }));
    } else {
      setNewMovie(prev => ({
        ...prev,
        genres: selectedOptions
      }));
    }
  };

  const handleCategoryChange = (e, isEditMode = false) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    
    if (isEditMode) {
      setEditingMovie(prev => ({
        ...prev,
        categories: selectedOptions
      }));
    } else {
      setNewMovie(prev => ({
        ...prev,
        categories: selectedOptions
      }));
    }
  };

  // Функції для роботи з сезонами та епізодами
  const addSeason = (isEditMode = false) => {
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    updateState({
      ...currentState,
      seasons: [
        ...currentState.seasons,
        {
          seasonNumber: currentState.seasons.length + 1,
          episodes: []
        }
      ]
    });
  };

  const removeSeason = (seasonIndex, isEditMode = false) => {
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    const updatedSeasons = currentState.seasons.filter((_, index) => index !== seasonIndex);
    
    // Оновлюємо номери сезонів
    const renumberedSeasons = updatedSeasons.map((season, index) => ({
      ...season,
      seasonNumber: index + 1
    }));
    
    updateState({
      ...currentState,
      seasons: renumberedSeasons
    });
  };

  const addEpisode = (seasonIndex, isEditMode = false) => {
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    const updatedSeasons = [...currentState.seasons];
    const season = updatedSeasons[seasonIndex];
    
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
    
    updateState({
      ...currentState,
      seasons: updatedSeasons
    });
  };

  const removeEpisode = (seasonIndex, episodeIndex, isEditMode = false) => {
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    const updatedSeasons = [...currentState.seasons];
    const season = updatedSeasons[seasonIndex];
    
    season.episodes = season.episodes.filter((_, index) => index !== episodeIndex);
    
    // Оновлюємо номери епізодів
    season.episodes = season.episodes.map((episode, index) => ({
      ...episode,
      episodeNumber: index + 1
    }));
    
    updateState({
      ...currentState,
      seasons: updatedSeasons
    });
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value, isEditMode = false) => {
    const updateState = isEditMode ? setEditingMovie : setNewMovie;
    const currentState = isEditMode ? editingMovie : newMovie;
    
    const updatedSeasons = [...currentState.seasons];
    const season = updatedSeasons[seasonIndex];
    const episode = { ...season.episodes[episodeIndex] };
    
    episode[field] = value;
    season.episodes[episodeIndex] = episode;
    
    updateState({
      ...currentState,
      seasons: updatedSeasons
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

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
                    <th>Категорії</th>
                    <th>Ціна</th>
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
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movie.genres?.map(genre => genre.name).join(', ') || 'Не вказано'}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movie.categories?.map(category => category.name).join(', ') || 'Не вказано'}
                        </div>
                      </td>
                      <td>
                        {movie.pricing?.isFree ? (
                          <span className="badge badge-success">Безкоштовно</span>
                        ) : (
                          <span className="badge badge-warning">{movie.pricing?.buyPrice} грн</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setEditingMovie(movie);
                              setPosterPreview(movie.posterImage);
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
              <form onSubmit={handleCreateMovie} encType="multipart/form-data">
                {/* Основна інформація */}
                <div className="form-group">
                  <label className="form-label">Назва фільму *</label>
                  <input
                    type="text"
                    value={newMovie.title}
                    onChange={(e) => handleInputChange(e)}
                    name="title"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис *</label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => handleInputChange(e)}
                    name="description"
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
                      onChange={(e) => handleInputChange(e)}
                      name="releaseYear"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв) *</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => handleInputChange(e)}
                      name="duration"
                      min="1"
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={newMovie.type}
                      onChange={(e) => handleInputChange(e)}
                      name="type"
                      className="form-select"
                    >
                      <option value="movie">Фільм</option>
                      <option value="series">Серіал</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <select
                      value={newMovie.film_language}
                      onChange={(e) => handleInputChange(e)}
                      name="film_language"
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
                      onChange={(e) => handleInputChange(e)}
                      name="country"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={newMovie.ageRating}
                      onChange={(e) => handleInputChange(e)}
                      name="ageRating"
                      className="form-select"
                    >
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське супроводження)</option>
                      <option value="PG-13">PG-13 (не рекомендовано до 13 років)</option>
                      <option value="R">R (до 17 років із дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Режисер</label>
                  <input
                    type="text"
                    value={newMovie.director}
                    onChange={(e) => handleInputChange(e)}
                    name="director"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={newMovie.cast.join(', ')}
                    onChange={(e) => handleInputChange(e)}
                    name="cast"
                    className="form-input"
                  />
                </div>
                
                {/* Жанри та категорії */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри *</label>
                    <select
                      multiple
                      value={newMovie.genres}
                      onChange={(e) => handleGenreChange(e)}
                      className="form-select"
                      style={{ height: '150px' }}
                    >
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Обрані жанри: {newMovie.genres.length > 0 
                        ? genres.filter(g => newMovie.genres.includes(g._id)).map(g => g.name).join(', ') 
                        : 'Не обрано'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Категорії *</label>
                    <select
                      multiple
                      value={newMovie.categories}
                      onChange={(e) => handleCategoryChange(e)}
                      className="form-select"
                      style={{ height: '150px' }}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name} ({category.type})
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Обрані категорії: {newMovie.categories.length > 0 
                        ? categories.filter(c => newMovie.categories.includes(c._id)).map(c => c.name).join(', ') 
                        : 'Не обрано'}
                    </div>
                  </div>
                </div>
                
                {/* Ціноутворення */}
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={newMovie.pricing.isFree}
                      onChange={(e) => handleInputChange(e)}
                      name="pricing.isFree"
                    />
                    <label htmlFor="isFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                  
                  {!newMovie.pricing.isFree && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">Ціна (грн) *</label>
                      <input
                        type="number"
                        value={newMovie.pricing.buyPrice}
                        onChange={(e) => handleInputChange(e)}
                        name="pricing.buyPrice"
                        min="0"
                        step="0.01"
                        required={!newMovie.pricing.isFree}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Файли */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Постер *</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e)}
                      name="posterImage"
                      accept="image/*"
                      className="form-input"
                    />
                    {posterPreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={posterPreview} 
                          alt="Poster Preview" 
                          style={{ maxWidth: '100px', maxHeight: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Трейлер</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e)}
                      name="trailerUrl"
                      accept="video/*"
                      className="form-input"
                    />
                    {movieFiles.trailerUrl && (
                      <div className="current-file">
                        Обрано: {movieFiles.trailerUrl.name}
                      </div>
                    )}
                  </div>
                  
                  {newMovie.type === 'movie' && (
                    <div className="form-group">
                      <label className="form-label">Відео</label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e)}
                        name="videoUrl"
                        accept="video/*"
                        className="form-input"
                      />
                      {movieFiles.videoUrl && (
                        <div className="current-file">
                          Обрано: {movieFiles.videoUrl.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Сезони та епізоди для серіалів */}
                {newMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      onClick={() => addSeason()}
                      className="btn btn-secondary add-season-btn"
                    >
                      + Додати сезон
                    </button>
                    
                    {newMovie.seasons.map((season, seasonIndex) => (
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
                          <button 
                            type="button" 
                            onClick={() => addEpisode(seasonIndex)}
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
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду *</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  required
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис епізоду</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв) *</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    min="1"
                                    required
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео епізоду</label>
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e)}
                                    name={`episode_${seasonIndex}_${episodeIndex}`}
                                    accept="video/*"
                                    className="form-input"
                                  />
                                  {episodeFiles[`episode_${seasonIndex}_${episodeIndex}`] && (
                                    <div className="current-file">
                                      Обрано: {episodeFiles[`episode_${seasonIndex}_${episodeIndex}`].name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {season.episodes.length === 0 && (
                            <div className="no-data" style={{ padding: '20px', textAlign: 'center' }}>
                              Немає епізодів. Додайте епізоди до сезону.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {newMovie.seasons.length === 0 && (
                      <div className="no-data" style={{ padding: '20px', textAlign: 'center' }}>
                        Немає сезонів. Додайте хоча б один сезон.
                      </div>
                    )}
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
              <form onSubmit={handleEditMovie} encType="multipart/form-data">
                {/* Основна інформація */}
                <div className="form-group">
                  <label className="form-label">Назва фільму *</label>
                  <input
                    type="text"
                    value={editingMovie.title}
                    onChange={(e) => handleInputChange(e, true)}
                    name="title"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис *</label>
                  <textarea
                    value={editingMovie.description}
                    onChange={(e) => handleInputChange(e, true)}
                    name="description"
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
                      onChange={(e) => handleInputChange(e, true)}
                      name="releaseYear"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тривалість (хв) *</label>
                    <input
                      type="number"
                      value={editingMovie.duration}
                      onChange={(e) => handleInputChange(e, true)}
                      name="duration"
                      min="1"
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Тип *</label>
                    <select
                      value={editingMovie.type}
                      onChange={(e) => handleInputChange(e, true)}
                      name="type"
                      className="form-select"
                    >
                      <option value="movie">Фільм</option>
                      <option value="series">Серіал</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <select
                      value={editingMovie.film_language || ""}
                      onChange={(e) => handleInputChange(e, true)}
                      name="film_language"
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
                      value={editingMovie.country || ""}
                      onChange={(e) => handleInputChange(e, true)}
                      name="country"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={editingMovie.ageRating}
                      onChange={(e) => handleInputChange(e, true)}
                      name="ageRating"
                      className="form-select"
                    >
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське супроводження)</option>
                      <option value="PG-13">PG-13 (не рекомендовано до 13 років)</option>
                      <option value="R">R (до 17 років із дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Режисер</label>
                  <input
                    type="text"
                    value={editingMovie.director || ""}
                    onChange={(e) => handleInputChange(e, true)}
                    name="director"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Актори (через кому)</label>
                  <input
                    type="text"
                    value={editingMovie.cast ? editingMovie.cast.join(', ') : ""}
                    onChange={(e) => handleInputChange(e, true)}
                    name="cast"
                    className="form-input"
                  />
                </div>
                
                {/* Жанри та категорії */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри *</label>
                    <select
                      multiple
                      value={editingMovie.genres ? editingMovie.genres.map(g => typeof g === 'object' ? g._id : g) : []}
                      onChange={(e) => handleGenreChange(e, true)}
                      className="form-select"
                      style={{ height: '150px' }}
                    >
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Обрані жанри: {editingMovie.genres && editingMovie.genres.length > 0 
                        ? genres.filter(g => editingMovie.genres.includes(g._id) || 
                                          editingMovie.genres.some(genre => typeof genre === 'object' && genre._id === g._id))
                                .map(g => g.name).join(', ') 
                        : 'Не обрано'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Категорії *</label>
                    <select
                      multiple
                      value={editingMovie.categories ? editingMovie.categories.map(c => typeof c === 'object' ? c._id : c) : []}
                      onChange={(e) => handleCategoryChange(e, true)}
                      className="form-select"
                      style={{ height: '150px' }}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name} ({category.type})
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Обрані категорії: {editingMovie.categories && editingMovie.categories.length > 0 
                        ? categories.filter(c => editingMovie.categories.includes(c._id) || 
                                             editingMovie.categories.some(cat => typeof cat === 'object' && cat._id === c._id))
                                   .map(c => c.name).join(', ') 
                        : 'Не обрано'}
                    </div>
                  </div>
                </div>
                
                {/* Ціноутворення */}
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="editIsFree"
                      checked={editingMovie.pricing?.isFree}
                      onChange={(e) => handleInputChange(e, true)}
                      name="pricing.isFree"
                    />
                    <label htmlFor="editIsFree" className="form-label">
                      Безкоштовний доступ
                    </label>
                  </div>
                  
                  {!editingMovie.pricing?.isFree && (
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label className="form-label">Ціна (грн) *</label>
                      <input
                        type="number"
                        value={editingMovie.pricing?.buyPrice}
                        onChange={(e) => handleInputChange(e, true)}
                        name="pricing.buyPrice"
                        min="0"
                        step="0.01"
                        required={!editingMovie.pricing?.isFree}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                {/* Файли */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Постер</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, true)}
                      name="posterImage"
                      accept="image/*"
                      className="form-input"
                    />
                    {posterPreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={posterPreview} 
                          alt="Poster Preview" 
                          style={{ maxWidth: '100px', maxHeight: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Трейлер</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, true)}
                      name="trailerUrl"
                      accept="video/*"
                      className="form-input"
                    />
                    {movieFiles.trailerUrl && (
                      <div className="current-file">
                        Обрано: {movieFiles.trailerUrl.name}
                      </div>
                    )}
                    {editingMovie.trailerUrl && !movieFiles.trailerUrl && (
                      <div className="current-file">
                        Поточний файл: {editingMovie.trailerUrl.split('/').pop()}
                      </div>
                    )}
                  </div>
                  
                  {editingMovie.type === 'movie' && (
                    <div className="form-group">
                      <label className="form-label">Відео</label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, true)}
                        name="videoUrl"
                        accept="video/*"
                        className="form-input"
                      />
                      {movieFiles.videoUrl && (
                        <div className="current-file">
                          Обрано: {movieFiles.videoUrl.name}
                        </div>
                      )}
                      {editingMovie.videoUrl && !movieFiles.videoUrl && (
                        <div className="current-file">
                          Поточний файл: {editingMovie.videoUrl.split('/').pop()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Сезони та епізоди для серіалів */}
                {editingMovie.type === 'series' && (
                  <div className="series-section">
                    <h3 className="section-title">Сезони та епізоди</h3>
                    
                    <button 
                      type="button" 
                      onClick={() => addSeason(true)}
                      className="btn btn-secondary add-season-btn"
                    >
                      + Додати сезон
                    </button>
                    
                    {editingMovie.seasons && editingMovie.seasons.map((season, seasonIndex) => (
                      <div key={seasonIndex} className="season-card">
                        <div className="season-header">
                          <h4>Сезон {season.seasonNumber}</h4>
                          <button 
                            type="button" 
                            onClick={() => removeSeason(seasonIndex, true)}
                            className="btn btn-danger btn-sm"
                          >
                            Видалити сезон
                          </button>
                        </div>
                        
                        <div className="episodes-list">
                          <button 
                            type="button" 
                            onClick={() => addEpisode(seasonIndex, true)}
                            className="btn btn-secondary btn-sm add-episode-btn"
                          >
                            + Додати епізод
                          </button>
                          
                          {season.episodes && season.episodes.map((episode, episodeIndex) => (
                            <div key={episodeIndex} className="episode-card">
                              <div className="episode-header">
                                <h5>Епізод {episode.episodeNumber}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => removeEpisode(seasonIndex, episodeIndex, true)}
                                  className="btn btn-danger btn-sm remove-btn"
                                >
                                  Видалити
                                </button>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Назва епізоду *</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value, true)}
                                  required
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label">Опис епізоду</label>
                                <textarea
                                  value={episode.description || ""}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value, true)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label className="form-label">Тривалість (хв) *</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value, true)}
                                    min="1"
                                    required
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label className="form-label">Відео епізоду</label>
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e, true)}
                                    name={`episode_${seasonIndex}_${episodeIndex}`}
                                    accept="video/*"
                                    className="form-input"
                                  />
                                  {episodeFiles[`episode_${seasonIndex}_${episodeIndex}`] && (
                                    <div className="current-file">
                                      Обрано: {episodeFiles[`episode_${seasonIndex}_${episodeIndex}`].name}
                                    </div>
                                  )}
                                  {episode.videoUrl && !episodeFiles[`episode_${seasonIndex}_${episodeIndex}`] && (
                                    <div className="current-file">
                                      Поточний файл: {episode.videoUrl.split('/').pop()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {(!season.episodes || season.episodes.length === 0) && (
                            <div className="no-data" style={{ padding: '20px', textAlign: 'center' }}>
                              Немає епізодів. Додайте епізоди до сезону.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!editingMovie.seasons || editingMovie.seasons.length === 0) && (
                      <div className="no-data" style={{ padding: '20px', textAlign: 'center' }}>
                        Немає сезонів. Додайте хоча б один сезон.
                      </div>
                    )}
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