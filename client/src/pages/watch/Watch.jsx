import React, { useEffect, useState, useContext } from "react";
import { ArrowBackOutlined } from "@material-ui/icons";
import "./Watch.scss";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../authContext/AuthContext";
import { userAPI } from "../../api/userAPI";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const movie = location.state?.movie;
  
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!movie) {
      navigate("/");
      return;
    }

    // Перевіряємо доступ до фільму
    const checkAccess = async () => {
      try {
        setLoading(true);
        
        // Якщо фільм безкоштовний, доступ є автоматично
        if (movie.pricing?.isFree) {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Інакше перевіряємо чи користувач купив фільм
        const data = await userAPI.checkAccess(movie._id);
        if (data.success) {
          setHasAccess(data.hasAccess);
          if (!data.hasAccess) {
            setError("У вас немає доступу до цього фільму. Будь ласка, придбайте його.");
          }
        }
      } catch (err) {
        console.error('Error checking access:', err);
        setError("Помилка перевірки доступу до фільму");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [movie, navigate]);

  if (loading) {
    return (
      <div className="watch loading">
        <div className="loading-spinner"></div>
        <p>Завантаження відео...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch error">
        <div className="error-message">
          <h2>{error}</h2>
          <div className="error-actions">
            <Link to={`/movie/${movie._id}`} className="back-btn">
              Повернутися до фільму
            </Link>
            <Link to={`/payment/${movie._id}`} className="payment-btn">
              Придбати фільм
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess && !movie.pricing?.isFree) {
    return (
      <div className="watch error">
        <div className="error-message">
          <h2>У вас немає доступу до цього фільму</h2>
          <div className="error-actions">
            <Link to={`/movie/${movie._id}`} className="back-btn">
              Повернутися до фільму
            </Link>
            <Link to={`/payment/${movie._id}`} className="payment-btn">
              Придбати фільм
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch">
      <div className="video-header">
        <Link to={`/movie/${movie._id}`} className="back">
          <ArrowBackOutlined />
          <span>Назад до фільму</span>
        </Link>
        <div className="movie-title">{movie.title}</div>
      </div>
      
      <div className="video-container">
        {movie.videoUrl ? (
          <video 
            className="video" 
            autoPlay 
            controls 
            src={movie.videoUrl}
            poster={movie.posterImage}
          />
        ) : (
          <div className="no-video">
            <h2>Відео недоступне</h2>
            <p>На жаль, відео для цього фільму тимчасово недоступне.</p>
            <Link to={`/movie/${movie._id}`} className="back-btn">
              Повернутися до фільму
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}