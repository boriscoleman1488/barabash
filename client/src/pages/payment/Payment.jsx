import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../authContext/AuthContext';
import Navbar from '../../components/navbar/Navbar';
import { movieAPI } from '../../api/movieAPI';
import { paymentAPI } from '../../api/paymentAPI';
import './Payment.scss';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    if (user?.accessToken && id) {
      fetchMovieDetails();
    }
  }, [user, id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await movieAPI.getById(id);
      
      if (data.success) {
        setMovie(data.movie);
        
        // Перевіряємо чи фільм платний
        if (data.movie.pricing?.isFree) {
          navigate(`/movie/${id}`);
          return;
        }
        
        setError('');
      } else {
        setError('Фільм не знайдено');
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError('Помилка завантаження фільму');
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Форматування номера картки
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    // Форматування терміну дії
    if (name === 'expiry') {
      formattedValue =  value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }

    // Форматування CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      setError('Введіть правильний номер картки');
      return false;
    }
    
    if (!cardData.expiry || cardData.expiry.length < 5) {
      setError('Введіть термін дії картки');
      return false;
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      setError('Введіть CVV код');
      return false;
    }
    
    if (!cardData.name.trim()) {
      setError('Введіть ім\'я власника картки');
      return false;
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateCardData()) return;

    try {
      setProcessing(true);
      setError('');

      // Створюємо оплату
      const paymentData = await paymentAPI.create({
        movieId: id,
        paymentMethod,
        amount: movie.pricing.buyPrice
      });

      if (paymentData.success) {
        // Симулюємо обробку платежу
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Підтверджуємо оплату
        const confirmData = await paymentAPI.confirm(
          paymentData.payment.transactionId,
          `provider_${Date.now()}`
        );

        if (confirmData.success) {
          // Перенаправляємо на сторінку успіху
          navigate('/payment/success', { 
            state: { 
              movie, 
              payment: confirmData.payment 
            } 
          });
        } else {
          setError('Помилка підтвердження оплати');
        }
      } else {
        setError(paymentData.message || 'Помилка створення оплати');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Помилка обробки платежу');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (amount) => {
    return `${amount} грн`;
  };

  if (loading) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error-container">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h2>{error}</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Повернутися на головну
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      
      <div className="payment-container">
        <div className="payment-content">
          {/* Movie Info */}
          <div className="movie-summary">
            <div className="movie-poster">
              <img src={movie.posterImage} alt={movie.title} />
            </div>
            <div className="movie-details">
              <h2>{movie.title}</h2>
              <p className="movie-year">{movie.releaseYear}</p>
              <div className="movie-genres">
                {movie.genres?.slice(0, 3).map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="price-info">
                <span className="price-label">Ціна:</span>
                <span className="price-value">{formatPrice(movie.pricing.buyPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-container">
            <h3>Оплата</h3>
            
            {error && (
              <div className="error-alert">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handlePayment} className="payment-form">
              <div className="payment-methods">
                <h4>Спосіб оплати</h4>
                <div className="methods-grid">
                  <label className={`method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div className="method-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>Кредитна картка</span>
                  </label>
                </div>
              </div>
              
              <div className="card-details">
                <h4>Дані картки</h4>
                
                <div className="form-group">
                  <label>Номер картки</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <input
                      type="text"
                      name="number"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={handleCardInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Термін дії</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Ім'я на картці</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="IVAN PETRENKO"
                    value={cardData.name}
                    onChange={handleCardInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Фільм:</span>
                  <span>{movie.title}</span>
                </div>
                <div className="summary-row">
                  <span>Тип:</span>
                  <span>{movie.type === 'movie' ? 'Фільм' : 'Серіал'}</span>
                </div>
                <div className="summary-row total">
                  <span>Загальна сума:</span>
                  <span>{formatPrice(movie.pricing.buyPrice)}</span>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => navigate(`/movie/${id}`)}
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="pay-btn"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="spinner"></div>
                      Обробка...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M2 3H22L20 15H4L2 3Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 3L4 15L6 21H18L20 15" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Оплатити {formatPrice(movie.pricing.buyPrice)}
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="payment-info">
              <div className="info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Безпечна оплата з шифруванням</span>
              </div>
              <div className="info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Доступ до фільму відразу після оплати</span>
              </div>
              <div className="info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Підтримка 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;