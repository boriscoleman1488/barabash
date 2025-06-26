import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { userAPI } from "../../api/userAPI";
import "./Users.css";

export default function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isAdmin: false
  });

  // Отримання списку користувачів
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await userAPI.getAll(page, 10);
      
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setCurrentPage(page);
      } else {
        setError(data.message || "Помилка завантаження користувачів");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  // Створення нового користувача
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const data = await userAPI.create(newUser);
      
      if (data.success) {
        setShowCreateModal(false);
        setNewUser({
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          isAdmin: false
        });
        fetchUsers(currentPage);
        alert("Користувач успішно створений!");
      } else {
        alert(data.message || "Помилка створення користувача");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Перемикання статусу користувача (активний/неактивний)
  const toggleUserStatus = async (userId) => {
    try {
      const data = await userAPI.toggleStatus(userId);
      
      if (data.success) {
        fetchUsers(currentPage);
        alert(data.message);
      } else {
        alert(data.message || "Помилка зміни статусу");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Перемикання ролі адміністратора
  const toggleAdminRole = async (userId) => {
    try {
      const data = await userAPI.toggleAdmin(userId);
      
      if (data.success) {
        fetchUsers(currentPage);
        alert(data.message);
      } else {
        alert(data.message || "Помилка зміни ролі");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Видалення користувача
  const deleteUser = async (userId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цього користувача?")) {
      return;
    }
    
    try {
      const data = await userAPI.delete(userId);
      
      if (data.success) {
        fetchUsers(currentPage);
        alert("Користувач успішно видалений!");
      } else {
        alert(data.message || "Помилка видалення користувача");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  // Фільтрація користувачів за пошуковим терміном
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Управління користувачами</h1>
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

      <div className="users-content">
        <div className="users-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Пошук користувачів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-user-btn"
          >
            + Створити користувача
          </button>
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Користувач</th>
                    <th>Email</th>
                    <th>Статус</th>
                    <th>Роль</th>
                    <th>Дата реєстрації</th>
                    <th>Останній вхід</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {(userItem.firstName?.[0] || userItem.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div className="user-details">
                            <div className="username">{userItem.username}</div>
                            <div className="full-name">
                              {userItem.firstName} {userItem.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`status-badge ${userItem.isActive ? 'active' : 'inactive'}`}>
                          {userItem.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${userItem.isAdmin ? 'admin' : 'user'}`}>
                          {userItem.isAdmin ? 'Адміністратор' : 'Користувач'}
                        </span>
                      </td>
                      <td>{formatDate(userItem.createdAt)}</td>
                      <td>{formatDate(userItem.lastLogin)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => toggleUserStatus(userItem._id)}
                            className={`action-btn ${userItem.isActive ? 'deactivate' : 'activate'}`}
                            title={userItem.isActive ? 'Деактивувати' : 'Активувати'}
                          >
                            {userItem.isActive ? '🚫' : '✅'}
                          </button>
                          
                          <button
                            onClick={() => toggleAdminRole(userItem._id)}
                            className={`action-btn ${userItem.isAdmin ? 'remove-admin' : 'make-admin'}`}
                            title={userItem.isAdmin ? 'Зняти права адміністратора' : 'Надати права адміністратора'}
                            disabled={userItem._id === user?.id}
                          >
                            {userItem.isAdmin ? '👤' : '👑'}
                          </button>
                          
                          <button
                            onClick={() => deleteUser(userItem._id)}
                            className="action-btn delete"
                            title="Видалити користувача"
                            disabled={userItem._id === user?.id}
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
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Попередня
              </button>
              
              <span className="pagination-info">
                Сторінка {currentPage} з {totalPages}
              </span>
              
              <button 
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Наступна →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модальне вікно створення користувача */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Створити нового користувача</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Ім'я користувача *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Пароль *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Ім'я</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Прізвище</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  />
                  Надати права адміністратора
                </label>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Скасувати
                </button>
                <button type="submit" className="submit-btn">
                  Створити користувача
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}