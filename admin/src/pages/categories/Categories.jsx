import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../api/categoryAPI";
import "./Categories.css";

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

  // Отримання списку категорій
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

  // Створення нової категорії
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

  // Редагування категорії
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

  // Видалення категорії
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

  // Пошук категорій
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

  // Фільтрація категорій за пошуковим терміном (локальний пошук)
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="categories-container">
        <div className="loading">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Управління категоріями</h1>
        <div>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/dashboard'}
            style={{ marginRight: '10px' }}
          >
            ← Назад
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Додати категорію
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-error">×</button>
        </div>
      )}

      {/* Пошук */}
      <div className="search-container">
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

      {/* Таблиця категорій */}
      <div className="categories-table">
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
                <td>{category.name}</td>
                <td>{category.description || "Без опису"}</td>
                <td>{category.type || "movie"}</td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingCategory({ ...category });
                      setShowEditModal(true);
                    }}
                    className="btn btn-sm btn-outline"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Видалити
                  </button>
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

      {/* Пагінація */}
      {totalPages > 1 && !searchTerm && (
        <div className="pagination">
          <button
            onClick={() => fetchCategories(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            Попередня
          </button>
          <span className="page-info">
            Сторінка {currentPage} з {totalPages}
          </span>
          <button
            onClick={() => fetchCategories(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Наступна
          </button>
        </div>
      )}

      {/* Модальне вікно створення */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Додати нову категорію</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Назва категорії:</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Опис:</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Тип:</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                >
                  <option value="movie">Фільми</option>
                  <option value="series">Серіали</option>
                  <option value="both">Обидва</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Створити
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редагувати категорію</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="form-group">
                <label>Назва категорії:</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Опис:</label>
                <textarea
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Тип:</label>
                <select
                  value={editingCategory.type || "movie"}
                  onChange={(e) => setEditingCategory({...editingCategory, type: e.target.value})}
                >
                  <option value="movie">Фільми</option>
                  <option value="series">Серіали</option>
                  <option value="both">Обидва</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Зберегти
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}