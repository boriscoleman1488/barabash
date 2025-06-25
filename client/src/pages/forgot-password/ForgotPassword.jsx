import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../authContext/apiCalls";
import "./ForgotPassword.scss";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await forgotPassword(email);

      if (data.success) {
        setMessage(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Помилка сервера. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix"
          />
        </div>
      </div>

      <div className="container">
        <div className="formContainer">
          <h1>Забули пароль?</h1>
          <p>Введіть свою email адресу, і ми надішлемо вам інструкції для відновлення паролю.</p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="forgotForm">
            <input
              type="email"
              placeholder="Email адреса"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button 
              type="submit" 
              className="submitButton"
              disabled={loading}
            >
              {loading ? "Відправка..." : "Відправити інструкції"}
            </button>
          </form>

          <div className="backToLogin">
            <Link to="/login">Повернутися до входу</Link>
          </div>
        </div>
      </div>
    </div>
  );
}