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
  const [cast, setCast] = useState([]);
  const [newCastMember, setNewCastMember] = useState("");
  const [seasons, setSeasons] = useState([]);
  const [isSeries, setIsSeries] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    duration: "",
    type: "movie",
    film_language: "",
    country: "",
    director: "",
    ageRating: "PG",
    pricing: {
      buyPrice: 0,
      isFree: true
    }
  });

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
    { code: "ru", name: "Російська" }
  ];

  useEffect(() => {
    fetchMovies();
    fetchGenres();
    fetchCategories();
  }, [currentPage]);

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

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Додаємо основні дані фільму
      Object.keys(newMovie).forEach(key => {
        if (key !== 'pricing' && key !== 'cast' && key !== 'seasons' && 
            newMovie[key] !== undefined && newMovie[key] !== null) {
          formData.append(key, newMovie[key]);
        }
      });
      
      // Додаємо ціноутворення
      formData.append('pricing[buyPrice]', newMovie.pricing.buyPrice);
      formData.append('pricing[isFree]', newMovie.pricing.isFree);
      
      // Додаємо жанри
      if (selectedGenres.length > 0) {
        formData.append('genres', JSON.stringify(selectedGenres));
      }
      
      // Додаємо категорії
      if (selectedCategories.length > 0) {
        formData.append('categories', JSON.stringify(selectedCategories));
      }
      
      // Додаємо акторів
      if (cast.length > 0) {
        formData.append('cast', JSON.stringify(cast));
      }
      
      // Додаємо сезони для серіалів
      if (isSeries && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
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
      
      const data = await movieAPI.createWithFiles(formData);
      
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchMovies(currentPage);
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
        if (key !== 'pricing' && key !== 'cast' && key !== 'seasons' && key !== '_id' && 
            key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' &&
            editingMovie[key] !== undefined && editingMovie[key] !== null) {
          formData.append(key, editingMovie[key]);
        }
      });
      
      // Додаємо ціноутворення
      if (editingMovie.pricing) {
        formData.append('pricing[buyPrice]', editingMovie.pricing.buyPrice);
        formData.append('pricing[isFree]', editingMovie.pricing.isFree);
      }
      
      // Додаємо жанри
      if (selectedGenres.length > 0) {
        formData.append('genres', JSON.stringify(selectedGenres));
      }
      
      // Додаємо категорії
      if (selectedCategories.length > 0) {
        formData.append('categories', JSON.stringify(selectedCategories));
      }
      
      // Додаємо акторів
      if (cast.length > 0) {
        formData.append('cast', JSON.stringify(cast));
      }
      
      // Додаємо сезони для серіалів
      if (isSeries && seasons.length > 0) {
        formData.append('seasons', JSON.stringify(seasons));
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
      
      const data = await movieAPI.updateWithFiles(editingMovie._id, formData);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingMovie(null);
        resetForm();
        fetchMovies(currentPage);
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

  const handleGenreChange = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleAddCastMember = () => {
    if (newCastMember.trim()) {
      setCast([...cast, newCastMember.trim()]);
      setNewCastMember("");
    }
  };

  const handleRemoveCastMember = (index) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const handleAddSeason = () => {
    setSeasons([...seasons, { seasonNumber: seasons.length + 1, episodes: [] }]);
  };

  const handleRemoveSeason = (index) => {
    setSeasons(seasons.filter((_, i) => i !== index));
  };

  const handleAddEpisode = (seasonIndex) => {
    const updatedSeasons = [...seasons];
    const season = updatedSeasons[seasonIndex];
    
    season.episodes.push({
      episodeNumber: season.episodes.length + 1,
      title: "",
      description: "",
      duration: 0,
      videoUrl: ""
    });
    
    setSeasons(updatedSeasons);
  };

  const handleRemoveEpisode = (seasonIndex, episodeIndex) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes = updatedSeasons[seasonIndex].episodes.filter((_, i) => i !== episodeIndex);
    setSeasons(updatedSeasons);
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes[episodeIndex][field] = value;
    setSeasons(updatedSeasons);
  };

  const handleEpisodeFileChange = (seasonIndex, episodeIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedSeasons = [...seasons];
      // Зберігаємо файл в об'єкті епізоду для подальшої обробки
      updatedSeasons[seasonIndex].episodes[episodeIndex].videoFile = file;
      // Зберігаємо ім'я файлу для відображення
      updatedSeasons[seasonIndex].episodes[episodeIndex].videoFileName = file.name;
      setSeasons(updatedSeasons);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      // Створюємо URL для превью
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  };

  const handleTrailerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTrailerFile(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
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
      ageRating: "PG",
      pricing: {
        buyPrice: 0,
        isFree: true
      }
    });
    setSelectedGenres([]);
    setSelectedCategories([]);
    setCast([]);
    setSeasons([]);
    setIsSeries(false);
    setPosterFile(null);
    setTrailerFile(null);
    setVideoFile(null);
    setPosterPreview("");
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setIsSeries(movie.type === 'series');
    
    // Встановлюємо вибрані жанри
    const genreIds = movie.genres?.map(genre => genre._id) || [];
    setSelectedGenres(genreIds);
    
    // Встановлюємо вибрані категорії
    const categoryIds = movie.categories?.map(category => category._id) || [];
    setSelectedCategories(categoryIds);
    
    // Встановлюємо акторів
    setCast(movie.cast || []);
    
    // Встановлюємо сезони
    setSeasons(movie.seasons || []);
    
    // Встановлюємо постер превью
    setPosterPreview(movie.posterImage || "");
    
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  const formatPrice = (movie) => {
    if (movie.pricing?.isFree) {
      return "Безкоштовно";
    } else {
      return `${movie.pricing?.buyPrice || 0} грн`;
    }
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
                            style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {movie.genres?.slice(0, 2).map((genre) => (
                            <span key={genre._id} className="badge badge-secondary">
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres?.length > 2 && (
                            <span className="badge badge-secondary">+{movie.genres.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${movie.pricing?.isFree ? 'badge-success' : 'badge-warning'}`}>
                          {formatPrice(movie)}
                        </span>
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
                    <label className="form-label">Тип *</label>
                    <select
                      value={newMovie.type}
                      onChange={(e) => {
                        setNewMovie({...newMovie, type: e.target.value});
                        setIsSeries(e.target.value === 'series');
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
                      max={new Date().getFullYear() + 5}
                      className="form-input"
                    />
                  </div>
                  
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
                  
                  <div className="form-group">
                    <label className="form-label">Вікове обмеження</label>
                    <select
                      value={newMovie.ageRating}
                      onChange={(e) => setNewMovie({...newMovie, ageRating: e.target.value})}
                      className="form-select"
                    >
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківський контроль)</option>
                      <option value="PG-13">PG-13 (від 13 років)</option>
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
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
                  <label className="form-label">Актори</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={newCastMember}
                      onChange={(e) => setNewCastMember(e.target.value)}
                      placeholder="Ім'я актора"
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCastMember}
                      className="btn btn-secondary"
                      disabled={!newCastMember.trim()}
                    >
                      Додати
                    </button>
                  </div>
                  
                  {cast.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      {cast.map((actor, index) => (
                        <div key={index} style={{ 
                          background: 'var(--background-color)', 
                          padding: '6px 12px', 
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>{actor}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCastMember(index)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              color: 'var(--danger-color)',
                              padding: '2px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {genres.map((genre) => (
                      <div key={genre._id} style={{ marginBottom: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '8px 12px',
                          background: selectedGenres.includes(genre._id) ? 'var(--primary-color)' : 'var(--background-color)',
                          color: selectedGenres.includes(genre._id) ? 'white' : 'var(--text-primary)',
                          borderRadius: '16px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre._id)}
                            onChange={() => handleGenreChange(genre._id)}
                            style={{ marginRight: '6px' }}
                          />
                          {genre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {categories.map((category) => (
                      <div key={category._id} style={{ marginBottom: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '8px 12px',
                          background: selectedCategories.includes(category._id) ? 'var(--primary-color)' : 'var(--background-color)',
                          color: selectedCategories.includes(category._id) ? 'white' : 'var(--text-primary)',
                          borderRadius: '16px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryChange(category._id)}
                            style={{ marginRight: '6px' }}
                          />
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={newMovie.pricing.isFree}
                        onChange={(e) => setNewMovie({
                          ...newMovie, 
                          pricing: {
                            ...newMovie.pricing,
                            isFree: e.target.checked
                          }
                        })}
                      />
                      Безкоштовний перегляд
                    </label>
                  </div>
                  
                  {!newMovie.pricing.isFree && (
                    <div style={{ marginTop: '10px' }}>
                      <label className="form-label">Ціна (грн) *</label>
                      <input
                        type="number"
                        value={newMovie.pricing.buyPrice}
                        onChange={(e) => setNewMovie({
                          ...newMovie, 
                          pricing: {
                            ...newMovie.pricing,
                            buyPrice: e.target.value
                          }
                        })}
                        min="0"
                        step="0.01"
                        required={!newMovie.pricing.isFree}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="form-input"
                    required
                  />
                  <div className="input-hint">
                    Рекомендований розмір: 500x750px, формат: JPG, PNG
                  </div>
                  {posterPreview && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={posterPreview} 
                        alt="Poster Preview" 
                        style={{ maxWidth: '200px', maxHeight: '300px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleTrailerChange}
                    className="form-input"
                  />
                  <div className="input-hint">
                    Максимальний розмір: 100MB, формат: MP4, WebM
                  </div>
                </div>
                
                {!isSeries && (
                  <div className="form-group">
                    <label className="form-label">Відео</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="form-input"
                    />
                    <div className="input-hint">
                      Максимальний розмір: 1GB, формат: MP4, WebM
                    </div>
                  </div>
                )}
                
                {/* Секція для серіалів */}
                {isSeries && (
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
                        
                        <button
                          type="button"
                          onClick={() => handleAddEpisode(seasonIndex)}
                          className="btn btn-secondary btn-sm add-episode-btn"
                        >
                          + Додати епізод
                        </button>
                        
                        <div className="episodes-list">
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
                                <label>Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label>Відео URL</label>
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
                    <label className="form-label">Тип *</label>
                    <select
                      value={editingMovie.type}
                      onChange={(e) => {
                        setEditingMovie({...editingMovie, type: e.target.value});
                        setIsSeries(e.target.value === 'series');
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
                      max={new Date().getFullYear() + 5}
                      className="form-input"
                    />
                  </div>
                  
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
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Мова</label>
                    <select
                      value={editingMovie.film_language}
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
                      value={editingMovie.country}
                      onChange={(e) => setEditingMovie({...editingMovie, country: e.target.value})}
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
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківський контроль)</option>
                      <option value="PG-13">PG-13 (від 13 років)</option>
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (від 18 років)</option>
                    </select>
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
                  <label className="form-label">Актори</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={newCastMember}
                      onChange={(e) => setNewCastMember(e.target.value)}
                      placeholder="Ім'я актора"
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCastMember}
                      className="btn btn-secondary"
                      disabled={!newCastMember.trim()}
                    >
                      Додати
                    </button>
                  </div>
                  
                  {cast.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      {cast.map((actor, index) => (
                        <div key={index} style={{ 
                          background: 'var(--background-color)', 
                          padding: '6px 12px', 
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>{actor}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCastMember(index)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              color: 'var(--danger-color)',
                              padding: '2px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Жанри</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {genres.map((genre) => (
                      <div key={genre._id} style={{ marginBottom: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '8px 12px',
                          background: selectedGenres.includes(genre._id) ? 'var(--primary-color)' : 'var(--background-color)',
                          color: selectedGenres.includes(genre._id) ? 'white' : 'var(--text-primary)',
                          borderRadius: '16px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre._id)}
                            onChange={() => handleGenreChange(genre._id)}
                            style={{ marginRight: '6px' }}
                          />
                          {genre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категорії</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {categories.map((category) => (
                      <div key={category._id} style={{ marginBottom: '8px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '8px 12px',
                          background: selectedCategories.includes(category._id) ? 'var(--primary-color)' : 'var(--background-color)',
                          color: selectedCategories.includes(category._id) ? 'white' : 'var(--text-primary)',
                          borderRadius: '16px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryChange(category._id)}
                            style={{ marginRight: '6px' }}
                          />
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ціноутворення</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={editingMovie.pricing?.isFree}
                        onChange={(e) => setEditingMovie({
                          ...editingMovie, 
                          pricing: {
                            ...editingMovie.pricing,
                            isFree: e.target.checked
                          }
                        })}
                      />
                      Безкоштовний перегляд
                    </label>
                  </div>
                  
                  {!editingMovie.pricing?.isFree && (
                    <div style={{ marginTop: '10px' }}>
                      <label className="form-label">Ціна (грн) *</label>
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
                        required={!editingMovie.pricing?.isFree}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="form-input"
                  />
                  <div className="input-hint">
                    Рекомендований розмір: 500x750px, формат: JPG, PNG
                  </div>
                  {posterPreview && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={posterPreview} 
                        alt="Poster Preview" 
                        style={{ maxWidth: '200px', maxHeight: '300px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Трейлер</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleTrailerChange}
                    className="form-input"
                  />
                  <div className="input-hint">
                    Максимальний розмір: 100MB, формат: MP4, WebM
                  </div>
                  {editingMovie.trailerUrl && (
                    <div className="current-file">
                      Поточний трейлер: <a href={editingMovie.trailerUrl} target="_blank" rel="noopener noreferrer">Переглянути</a>
                    </div>
                  )}
                </div>
                
                {!isSeries && (
                  <div className="form-group">
                    <label className="form-label">Відео</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="form-input"
                    />
                    <div className="input-hint">
                      Максимальний розмір: 1GB, формат: MP4, WebM
                    </div>
                    {editingMovie.videoUrl && (
                      <div className="current-file">
                        Поточне відео: <a href={editingMovie.videoUrl} target="_blank" rel="noopener noreferrer">Переглянути</a>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Секція для серіалів */}
                {isSeries && (
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
                        
                        <button
                          type="button"
                          onClick={() => handleAddEpisode(seasonIndex)}
                          className="btn btn-secondary btn-sm add-episode-btn"
                        >
                          + Додати епізод
                        </button>
                        
                        <div className="episodes-list">
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
                                <label>Назва епізоду</label>
                                <input
                                  type="text"
                                  value={episode.title}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                  className="form-input"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="form-textarea"
                                />
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Тривалість (хв)</label>
                                  <input
                                    type="number"
                                    value={episode.duration}
                                    onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                    min="1"
                                    className="form-input"
                                  />
                                </div>
                                
                                <div className="form-group">
                                  <label>Відео URL</label>
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
                                  {episode.videoUrl && !episode.videoFileName && (
                                    <div className="current-file">
                                      Поточне відео: <a href={episode.videoUrl} target="_blank" rel="noopener noreferrer">Переглянути</a>
                                    </div>
                                  )}
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