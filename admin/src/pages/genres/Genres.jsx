import { useState, useEffect } from "react";
import { genreAPI } from "../../api/genreAPI";
import "./Genres.css";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [newGenre, setNewGenre] = useState({
    name: "",
    description: ""
  });

  // Отримання списку жанрів
  const fetchGenres = async (page = 1) => {
    try {
      setLoading(true);
      const data = await genreAPI.getAll(page, 10);
      
      if (data.success) {
        setGenres(data.genres);
        setTotalPages(data.pagination.pages);
        setCurrentPage(page);
      } else {
        setError(data.message || "Помилка завантаження жанрів");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  // Створення нового жанру
  const handleCreateGenre = async (e) => {
    e.preventDefault();
    try {
      const data = await genreAPI.create(newGenre);
      
      if (data.success) {
        setShowCreateModal(false);
        setNewGenre({
          name: "",
          description: ""
        });
        fetchGenres(currentPage);
        alert("Жанр успішно створений!");
      } else {
        alert(data.message || "Помилка створення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Редагування жанру
  const handleEditGenre = async (e) => {
    e.preventDefault();
    try {
      const data = await genreAPI.update(editingGenre._id, editingGenre);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingGenre(null);
        fetchGenres(currentPage);
        alert("Жанр успішно оновлений!");
      } else {
        alert(data.message || "Помилка оновлення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Видалення жанру
  const deleteGenre = async (genreId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей жанр?")) {
      return;
    }
    
    try {
      const data = await genreAPI.delete(genreId);
      
      if (data.success) {
        fetchGenres(currentPage);
        alert("Жанр успішно видалений!");
      } else {
        alert(data.message || "Помилка видалення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Відкриття модального вікна редагування
  const openEditModal = (genre) => {
    setEditingGenre({ ...genre });
    setShowEditModal(true);
  };

  // Фільтрація жанрів за пошуковим терміном
  const filteredGenres = genres.filter(genre => 
    genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (genre.description && genre.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Зміна статусу жанру
  const toggleGenreStatus = async (genreId) => {
    try {
      const data = await genreAPI.toggleStatus(genreId);
      
      if (data.success) {
        fetchGenres(currentPage);
        alert(data.message || "Статус жанру успішно змінений!");
      } else {
        alert(data.message || "Помилка зміни статусу жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  return (
    <div className="genres-page">
      <div className="genres-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Управління жанрами</h1>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="back-btn"
            >
              ← Назад до Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="genres-content">
        <div className="genres-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Пошук жанрів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-genre-btn"
          >
            + Створити жанр
          </button>
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="genres-table">
              <table>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Статус</th>
                    <th>Дата створення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGenres.map((genre) => (
                    <tr key={genre._id}>
                      <td>
                        <div className="genre-name">{genre.name}</div>
                      </td>
                      <td>
                        <div className="genre-description">
                          {genre.description || "Опис відсутній"}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${genre.isActive ? 'active' : 'inactive'}`}>
                          {genre.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                      </td>
                      <td>{formatDate(genre.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => toggleGenreStatus(genre._id)}
                            className={`action-btn toggle ${genre.isActive ? 'deactivate' : 'activate'}`}
                            title={genre.isActive ? 'Деактивувати жанр' : 'Активувати жанр'}
                          >
                            {genre.isActive ? '🔴' : '🟢'}
                          </button>
                          
                          <button
                            onClick={() => openEditModal(genre)}
                            className="action-btn edit"
                            title="Редагувати жанр"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => deleteGenre(genre._id)}
                            className="action-btn delete"
                            title="Видалити жанр"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагінація */}
            <div className="pagination">
              <button 
                onClick={() => fetchGenres(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Попередня
              </button>
              
              <span className="pagination-info">
                Сторінка {currentPage} з {totalPages}
              </span>
              
              <button 
                onClick={() => fetchGenres(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Наступна →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модальне вікно створення жанру */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Створити новий жанр</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateGenre} className="modal-form">
              <div className="form-group">
                <label>Назва жанру *</label>
                <input
                  type="text"
                  value={newGenre.name}
                  onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Опис</label>
                <textarea
                  value={newGenre.description}
                  onChange={(e) => setNewGenre({...newGenre, description: e.target.value})}
                  rows="3"
                  placeholder="Опис жанру (необов'язково)"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Скасувати
                </button>
                <button type="submit" className="submit-btn">
                  Створити жанр
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування жанру */}
      {showEditModal && editingGenre && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редагувати жанр</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditGenre} className="modal-form">
              <div className="form-group">
                <label>Назва жанру *</label>
                <input
                  type="text"
                  value={editingGenre.name}
                  onChange={(e) => setEditingGenre({...editingGenre, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Опис</label>
                <textarea
                  value={editingGenre.description || ""}
                  onChange={(e) => setEditingGenre({...editingGenre, description: e.target.value})}
                  rows="3"
                  placeholder="Опис жанру (необов'язково)"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Скасувати
                </button>
                <button type="submit" className="submit-btn">
                  Зберегти зміни
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}