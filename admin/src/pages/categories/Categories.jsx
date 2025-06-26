import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../api/categoryAPI";
import "../../styles/admin-common.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "movie"
  });

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAll(page, 10);
      
      if (data.success) {
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
        setError("");
      } else {
        setError(data.message || "Помилка завантаження категорій");
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError(err.response?.data?.message || "Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const data = await categoryAPI.create(newCategory);
      
      if (data.success) {
        setShowCreateModal(false);
        setNewCategory({
          name: "",
          description: "",
          type: "movie"
        });
        fetchCategories(currentPage);
        setError("");
        alert("Категорія успішно створена!");
      } else {
        setError(data.message || "Помилка створення категорії");
      }
    } catch (err) {
      console.error('Create category error:', err);
      setError(err.response?.data?.message || "Помилка створення категорії");
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const data = await categoryAPI.update(editingCategory._id, editingCategory);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingCategory(null);
        fetchCategories(currentPage);
        setError("");
        alert("Категорія успішно оновлена!");
      } else {
        setError(data.message || "Помилка оновлення категорії");
      }
    } catch (err) {
      console.error('Update category error:', err);
      setError(err.response?.data?.message || "Помилка оновлення категорії");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        const data = await categoryAPI.delete(categoryId);
        
        if (data.success) {
          fetchCategories(currentPage);
          setError("");
          alert("Категорія успішно видалена!");
        } else {
          setError(data.message || "Помилка видалення категорії");
        }
      } catch (err) {
        console.error('Delete category error:', err);
        setError(err.response?.data?.message || "Помилка видалення категорії");
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const data = await categoryAPI.search(searchTerm);
        
        if (data.success) {
          setCategories(data.categories || []);
          setTotalPages(1);
          setCurrentPage(1);
          setError("");
        } else {
          setError(data.message || "Помилка пошуку");
        }
      } catch (err) {
        console.error('Search categories error:', err);
        setError(err.response?.data?.message || "Помилка пошуку");
      } finally {
        setLoading(false);
      }
    } else {
      fetchCategories(1);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchCategories();
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
            <h1 className="page-title">Управління категоріями</h1>
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
              placeholder="Пошук категорій..."
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
                  fetchCategories(1);
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
            + Створити категорію
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
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Тип</th>
                    <th>Дата створення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td className="font-weight-bold">{category.name}</td>
                      <td className="text-secondary">{category.description || "Без опису"}</td>
                      <td>
                        <span className={`badge ${category.type === 'movie' ? 'badge-info' : category.type === 'series' ? 'badge-warning' : 'badge-secondary'}`}>
                          {category.type === 'movie' ? 'Фільми' : category.type === 'series' ? 'Серіали' : category.type || 'movie'}
                        </span>
                      </td>
                      <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setEditingCategory({ ...category });
                              setShowEditModal(true);
                            }}
                            className="action-btn action-btn-edit"
                            title="Редагувати категорію"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="action-btn action-btn-delete"
                            title="Видалити категорію"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCategories.length === 0 && (
                <div className="no-data">
                  {searchTerm ? "Категорії не знайдені" : "Немає категорій"}
                </div>
              )}
            </div>

            {totalPages > 1 && !searchTerm && (
              <div className="pagination">
                <button
                  onClick={() => fetchCategories(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  ← Попередня
                </button>
                <span className="pagination-info">
                  Сторінка {currentPage} з {totalPages}
                </span>
                <button
                  onClick={() => fetchCategories(currentPage + 1)}
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

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Додати нову категорію</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label className="form-label">Назва категорії *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    rows="3"
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Тип</label>
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="movie">Фільми</option>
                    <option value="series">Серіали</option>
                    <option value="both">Обидва</option>
                  </select>
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

      {showEditModal && editingCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Редагувати категорію</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditCategory}>
                <div className="form-group">
                  <label className="form-label">Назва категорії *</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис</label>
                  <textarea
                    value={editingCategory.description || ""}
                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                    rows="3"
                    className="form-textarea"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Тип</label>
                  <select
                    value={editingCategory.type || "movie"}
                    onChange={(e) => setEditingCategory({...editingCategory, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="movie">Фільми</option>
                    <option value="series">Серіали</option>
                    <option value="both">Обидва</option>
                  </select>
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