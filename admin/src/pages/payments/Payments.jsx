import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/admin-common.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Отримуємо токен з localStorage
  const getAuthToken = () => {
    const adminUserData = localStorage.getItem("admin_user");
    if (adminUserData) {
      try {
        const adminUser = JSON.parse(adminUserData);
        return adminUser.accessToken;
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        return null;
      }
    }
    return null;
  };

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError("Токен доступу не знайдено");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE_URL}/payments/admin/all?${params}`, {
        headers: {
          'token': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
        setError("");
      } else {
        setError(data.message || "Помилка завантаження оплат");
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/payments/admin/stats`, {
        headers: {
          'token': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm("Ви впевнені, що хочете повернути кошти за цю оплату?")) {
      return;
    }

    try {
      const token = getAuthToken();
      const refundReason = prompt("Введіть причину повернення коштів:");
      
      if (!refundReason) return;

      const response = await fetch(`${API_BASE_URL}/payments/admin/refund/${transactionId}`, {
        method: 'POST',
        headers: {
          'token': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refundReason })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Кошти успішно повернено!");
        fetchPayments(currentPage);
        fetchStats();
      } else {
        alert(data.message || "Помилка повернення коштів");
      }
    } catch (err) {
      console.error('Refund error:', err);
      alert("Помилка з'єднання з сервером");
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.movieId?.title?.toLowerCase().includes(searchLower) ||
      payment.userId?.username?.toLowerCase().includes(searchLower) ||
      payment.userId?.email?.toLowerCase().includes(searchLower) ||
      payment.transactionId?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  const formatPrice = (amount, currency = 'UAH') => {
    return `${amount} ${currency}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Очікує', class: 'badge-warning' },
      completed: { text: 'Завершено', class: 'badge-success' },
      failed: { text: 'Помилка', class: 'badge-danger' },
      refunded: { text: 'Повернено', class: 'badge-info' },
      cancelled: { text: 'Скасовано', class: 'badge-secondary' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
    
    return (
      <span className={`badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [statusFilter]);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H22L20 15H4L2 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 3L4 15L6 21H18L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="page-title">Управління оплатами</h1>
          </div>
          
          <div className="header-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              ← Назад до Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Статистика */}
        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ background: 'var(--card-background)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Всього оплат</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-background)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--success-color)' }}>Завершено</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.completed}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-background)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--warning-color)' }}>Очікують</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pending}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-background)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--success-color)' }}>Загальний дохід</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatPrice(stats.totalRevenue)}</div>
            </div>
          </div>
        )}

        <div className="page-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Пошук оплат..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="">Всі статуси</option>
              <option value="pending">Очікує</option>
              <option value="completed">Завершено</option>
              <option value="failed">Помилка</option>
              <option value="refunded">Повернено</option>
              <option value="cancelled">Скасовано</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Користувач</th>
                    <th>Фільм</th>
                    <th>Сума</th>
                    <th>Статус</th>
                    <th>Метод оплати</th>
                    <th>Дата</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <div>
                          <div className="font-weight-bold">{payment.userId?.username}</div>
                          <div className="text-secondary" style={{ fontSize: '12px' }}>
                            {payment.userId?.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {payment.movieId?.posterImage && (
                            <img 
                              src={payment.movieId.posterImage} 
                              alt={payment.movieId.title}
                              style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div>
                            <div className="font-weight-bold">{payment.movieId?.title}</div>
                            <div className="text-secondary" style={{ fontSize: '12px' }}>
                              {payment.movieId?.type === 'movie' ? 'Фільм' : 'Серіал'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-weight-bold">{formatPrice(payment.amount, payment.currency)}</td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {payment.paymentMethod === 'card' ? 'Картка' : payment.paymentMethod}
                      </td>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => handleRefund(payment.transactionId)}
                              className="action-btn action-btn-delete"
                              title="Повернути кошти"
                            >
                              💰
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              const details = `
ID транзакції: ${payment.transactionId}
Провайдер: ${payment.paymentProvider}
ID провайдера: ${payment.providerTransactionId || 'Не вказано'}
Доступ надано: ${payment.accessGranted ? 'Так' : 'Ні'}
Термін доступу: ${payment.accessExpiryDate ? formatDate(payment.accessExpiryDate) : 'Не вказано'}
                              `.trim();
                              alert(details);
                            }}
                            className="action-btn action-btn-edit"
                            title="Деталі оплати"
                          >
                            ℹ️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="no-data">
                  {searchTerm ? "Оплати не знайдені" : "Немає оплат"}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => fetchPayments(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  ← Попередня
                </button>
                <span className="pagination-info">
                  Сторінка {currentPage} з {totalPages}
                </span>
                <button
                  onClick={() => fetchPayments(currentPage + 1)}
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
    </div>
  );
}