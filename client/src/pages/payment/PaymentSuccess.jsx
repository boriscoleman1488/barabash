import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import './PaymentSuccess.scss';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, payment } = location.state || {};

  useEffect(() => {
    // Якщо немає даних про оплату, перенаправляємо на головну
    if (!movie || !payment) {
      navigate('/');
    }
  }, [movie, payment, navigate]);

  if (!movie || !payment) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount, currency = 'UAH') => {
    return `${amount} ${currency}`;
  };

  return (
    <div className="payment-success-page">
      <Navbar />
      
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          
          <h1>Оплата успішна!</h1>
          <p className="success-message">
            Дякуємо за вашу оплату. Ви отримали доступ до перегляду фільму.
          </p>
          
          <div className="payment-details">
            <div className="detail-row">
              <span className="label">Фільм:</span>
              <span className="value">{movie.title}</span>
            </div>
            <div className="detail-row">
              <span className="label">Сума:</span>
              <span className="value">{formatPrice(payment.amount, payment.currency)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Дата оплати:</span>
              <span className="value">{formatDate(payment.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="label">ID транзакції:</span>
              <span className="value transaction-id">{payment.transactionId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Статус:</span>
              <span className="value status-badge">Успішно</span>
            </div>
          </div>
          
          <div className="action-buttons">
            <Link to={`/movie/${movie._id}`} className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Повернутися до фільму
            </Link>
            <Link to="/watch" state={{ movie }} className="btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
              Дивитися зараз
            </Link>
          </div>
          
          <div className="additional-info">
            <p>Квитанція про оплату була відправлена на вашу електронну пошту.</p>
            <p>Якщо у вас є запитання, будь ласка, зв'яжіться з нашою службою підтримки.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;