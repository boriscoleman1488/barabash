import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext/AuthContext";
import { userAPI } from "../../api/userAPI";
import "../../styles/admin-common.css";

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
            <h1 className="page-title">Управління користувачами</h1>
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
        <div className="page-controls">
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
            className="btn btn-success"
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
            <div className="data-table">
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
                        <div className="d-flex align-items-center gap-3">
                          <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {(userItem.firstName?.[0] || userItem.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-weight-bold">{userItem.username}</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                              {userItem.firstName} {userItem.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`badge ${userItem.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {userItem.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${userItem.isAdmin ? 'badge-warning' : 'badge-info'}`}>
                          {userItem.isAdmin ? 'Адміністратор' : 'Користувач'}
                        </span>
                      </td>
                      <td>{formatDate(userItem.createdAt)}</td>
                      <td>{formatDate(userItem.lastLogin)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => toggleUserStatus(userItem._id)}
                            className={`action-btn ${userItem.isActive ? 'action-btn-delete' : 'action-btn-toggle'}`}
                            title={userItem.isActive ? 'Деактивувати' : 'Активувати'}
                          >
                            {userItem.isActive ? '🚫' : '✅'}
                          </button>
                          
                          <button
                            onClick={() => toggleAdminRole(userItem._id)}
                            className="action-btn action-btn-edit"
                            title={userItem.isAdmin ? 'Зняти права адміністратора' : 'Надати права адміністратора'}
                            disabled={userItem._id === user?.id}
                          >
                            {userItem.isAdmin ? '👤' : '👑'}
                          </button>
                          
                          <button
                            onClick={() => deleteUser(userItem._id)}
                            className="action-btn action-btn-delete"
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

            <div className="pagination">
              <button 
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                ← Попередня
              </button>
              
              <span className="pagination-info">
                Сторінка {currentPage} з {totalPages}
              </span>
              
              <button 
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Наступна →
              </button>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Створити нового користувача</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label className="form-label">Ім'я користувача *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Пароль *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ім'я</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Прізвище</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  />
                  <label htmlFor="isAdmin" className="form-label">
                    Надати права адміністратора
                  </label>
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                    Скасувати
                  </button>
                  <button type="submit" className="btn btn-success">
                    Створити користувача
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