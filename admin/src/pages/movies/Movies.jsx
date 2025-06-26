import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { movieAPI } from "../../api/movieAPI";
import { genreAPI } from "../../api/genreAPI";
import { categoryAPI } from "../../api/categoryAPI";
import "../../styles/admin-common.css";

export default function Movies() {
  const { user } = useContext(AuthContext);
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
    type: "movie",
    film_language: "",
    country: "",
    director: "",
    cast: "",
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
        if (newMovie[key] !== undefined && newMovie[key] !== null) {
          if (key === 'pricing') {
            formData.append('pricing.buyPrice', newMovie.pricing.buyPrice);
            formData.append('pricing.isFree', newMovie.pricing.isFree);
          } else {
            formData.append(key, newMovie[key]);
          }
        }
      });
      
      // Додаємо файли
      if (posterFile) {
        formData.append('posterImage', posterFile);
      }
      
      if (trailerFile) {
        formData.append('trailerUrl', trailerFile);
      }
      
      if (videoFile && newMovie.type === 'movie') {
        formData.append('videoUrl', videoFile);
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
      if (newMovie.cast) {
        formData.append('cast', newMovie.cast);
      }
      
      // Додаємо сезони для серіалів
      if (newMovie.type === 'series' && seasons.length > 0) {
        // Підготовка сезонів для відправки
        const seasonsData = seasons.map(season => {
          const seasonData = {
            seasonNumber: season.seasonNumber,
            episodes: season.episodes.map(episode => ({
              episodeNumber: episode.episodeNumber,
              title: episode.title,
              description: episode.description,
              duration: episode.duration
            }))
          };
          return seasonData;
        });
        
        formData.append('seasons', JSON.stringify(seasonsData));
        
        // Додаємо файли епізодів
        seasons.forEach((season, seasonIndex) => {
          season.episodes.forEach((episode, episodeIndex) => {
            if (episode.videoFile) {
              formData.append(
                `season_${seasonIndex}_episode_${episodeIndex}_video`, 
                episode.videoFile
              );
            }
          });
        });
      }
      
      const data = await movieAPI.create(formData);
      
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
        if (editingMovie[key] !== undefined && editingMovie[key] !== null && 
            key !== 'genres' && key !== 'categories' && key !== '_id' && 
            key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          
          if (key === 'pricing') {
            formData.append('pricing.buyPrice', editingMovie.pricing.buyPrice);
            formData.append('pricing.isFree', editingMovie.pricing.isFree);
          } else {
            formData.append(key, editingMovie[key]);
          }
        }
      });
      
      // Додаємо файли
      if (posterFile) {
        formData.append('posterImage', posterFile);
      }
      
      if (trailerFile) {
        formData.append('trailerUrl', trailerFile);
      }
      
      if (videoFile && editingMovie.type === 'movie') {
        formData.append('videoUrl', videoFile);
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
      if (editingMovie.cast) {
        if (typeof editingMovie.cast === 'string') {
          formData.append('cast', editingMovie.cast);
        } else if (Array.isArray(editingMovie.cast)) {
          formData.append('cast', editingMovie.cast.join(','));
        }
      }
      
      // Додаємо сезони для серіалів
      if (editingMovie.type === 'series' && seasons.length > 0) {
        // Підготовка сезонів для відправки
        const seasonsData = seasons.map(season => {
          const seasonData = {
            seasonNumber: season.seasonNumber,
            episodes: season.episodes.map(episode => ({
              episodeNumber: episode.episodeNumber,
              title: episode.title,
              description: episode.description,
              duration: episode.duration
            }))
          };
          return seasonData;
        });
        
        formData.append('seasons', JSON.stringify(seasonsData));
        
        // Додаємо файли епізодів
        seasons.forEach((season, seasonIndex) => {
          season.episodes.forEach((episode, episodeIndex) => {
            if (episode.videoFile) {
              formData.append(
                `season_${seasonIndex}_episode_${episodeIndex}_video`, 
                episode.videoFile
              );
            }
          });
        });
      }
      
      const data = await movieAPI.update(editingMovie._id, formData);
      
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

  const handleGenreChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedGenres(selectedValues);
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedCategories(selectedValues);
  };

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
      cast: "",
      ageRating: "PG",
      pricing: {
        buyPrice: 0,
        isFree: true
      }
    });
    setSelectedGenres([]);
    setSelectedCategories([]);
    setPosterFile(null);
    setTrailerFile(null);
    setVideoFile(null);
    setSeasons([]);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    
    // Встановлюємо вибрані жанри
    if (movie.genres) {
      const genreIds = movie.genres.map(genre => 
        typeof genre === 'object' ? genre._id : genre
      );
      setSelectedGenres(genreIds);
    } else {
      setSelectedGenres([]);
    }
    
    // Встановлюємо вибрані категорії
    if (movie.categories) {
      const categoryIds = movie.categories.map(category => 
        typeof category === 'object' ? category._id : category
      );
      setSelectedCategories(categoryIds);
    } else {
      setSelectedCategories([]);
    }
    
    // Встановлюємо сезони для серіалів
    if (movie.type === 'series' && movie.seasons && movie.seasons.length > 0) {
      setSeasons(movie.seasons.map(season => ({
        ...season,
        episodes: season.episodes.map(episode => ({
          ...episode,
          videoFileName: episode.videoUrl ? 'Відео вже завантажено' : null
        }))
      })));
    } else {
      setSeasons([]);
    }
    
    setShowEditModal(true);
  };

  const addSeason = () => {
    const newSeasonNumber = seasons.length > 0 
      ? Math.max(...seasons.map(s => s.seasonNumber)) + 1 
      : 1;
    
    setSeasons([...seasons, {
      seasonNumber: newSeasonNumber,
      episodes: []
    }]);
  };

  const removeSeason = (index) => {
    const newSeasons = [...seasons];
    newSeasons.splice(index, 1);
    setSeasons(newSeasons);
  };

  const addEpisode = (seasonIndex) => {
    const newSeasons = [...seasons];
    const newEpisodeNumber = newSeasons[seasonIndex].episodes.length > 0 
      ? Math.max(...newSeasons[seasonIndex].episodes.map(e => e.episodeNumber)) + 1 
      : 1;
    
    newSeasons[seasonIndex].episodes.push({
      episodeNumber: newEpisodeNumber,
      title: '',
      description: '',
      duration: '',
      videoFile: null,
      videoFileName: null
    });
    
    setSeasons(newSeasons);
  };

  const removeEpisode = (seasonIndex, episodeIndex) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
    setSeasons(newSeasons);
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex][field] = value;
    setSeasons(newSeasons);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
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
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movie.genres?.map(genre => 
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
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське супроводження)</option>
                      <option value="PG-13">PG-13 (не рекомендовано до 13 років)</option>
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
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
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри</label>
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
                    <div className="input-hint">
                      Утримуйте Ctrl (Cmd на Mac) для вибору кількох жанрів
                    </div>
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
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Утримуйте Ctrl (Cmd на Mac) для вибору кількох категорій
                    </div>
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
                        pricing: {
                          ...newMovie.pricing,
                          buyPrice: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="form-label">
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
                      Безкоштовний доступ
                    </label>
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
                        
                        <button 
                          type="button" 
                          onClick={() => addEpisode(seasonIndex)}
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
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  className="form-textarea"
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
                      <option value="G">G (загальна аудиторія)</option>
                      <option value="PG">PG (рекомендовано батьківське супроводження)</option>
                      <option value="PG-13">PG-13 (не рекомендовано до 13 років)</option>
                      <option value="R">R (до 17 років з дорослими)</option>
                      <option value="NC-17">NC-17 (тільки для дорослих)</option>
                    </select>
                  </div>
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
                    value={Array.isArray(editingMovie.cast) ? editingMovie.cast.join(', ') : (editingMovie.cast || '')}
                    onChange={(e) => setEditingMovie({...editingMovie, cast: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Жанри</label>
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
                    <div className="input-hint">
                      Утримуйте Ctrl (Cmd на Mac) для вибору кількох жанрів
                    </div>
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
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="input-hint">
                      Утримуйте Ctrl (Cmd на Mac) для вибору кількох категорій
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ціна (грн)</label>
                    <input
                      type="number"
                      value={editingMovie.pricing?.buyPrice || 0}
                      onChange={(e) => setEditingMovie({
                        ...editingMovie, 
                        pricing: {
                          ...editingMovie.pricing,
                          buyPrice: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        checked={editingMovie.pricing?.isFree || false}
                        onChange={(e) => setEditingMovie({
                          ...editingMovie, 
                          pricing: {
                            ...editingMovie.pricing,
                            isFree: e.target.checked
                          }
                        })}
                      />
                      Безкоштовний доступ
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Постер</label>
                  {editingMovie.posterImage && (
                    <div style={{ marginBottom: '10px' }}>
                      <img 
                        src={editingMovie.posterImage} 
                        alt="Current poster" 
                        style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
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
                      Поточний трейлер: {editingMovie.trailerUrl}
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
                        Поточне відео: {editingMovie.videoUrl}
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
                        
                        <button 
                          type="button" 
                          onClick={() => addEpisode(seasonIndex)}
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
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Опис</label>
                                <textarea
                                  value={episode.description}
                                  onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                                  className="form-textarea"
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
                                      {episode.videoFileName}
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