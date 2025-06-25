import { useState } from "react";
import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../authContext/apiCalls";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await register(formData);
      
      if (response.success) {
        setMessage(response.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || "Помилка реєстрації");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix"
          />
          <Link to="/login" className="loginButton">
            Увійти
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="formContainer">
          <h1>Створити акаунт</h1>
          <p>Приєднуйтесь до мільйонів користувачів BestFlix</p>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="registerForm">
            <div className="inputGroup">
              <input
                type="text"
                name="firstName"
                placeholder="Ім'я"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Прізвище"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <input
              type="text"
              name="username"
              placeholder="Ім'я користувача"
              value={formData.username}
              onChange={handleChange}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email адреса"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Пароль (мінімум 6 символів)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />

            <button 
              type="submit" 
              className="registerButton"
              disabled={loading}
            >
              {loading ? "Реєстрація..." : "Зареєструватися"}
            </button>
          </form>

          <div className="loginLink">
            Вже маєте акаунт? <Link to="/login">Увійти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}