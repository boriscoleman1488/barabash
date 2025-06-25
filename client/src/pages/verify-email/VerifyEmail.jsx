import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyEmail } from "../../authContext/apiCalls";
import "./VerifyEmail.scss";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleVerifyEmail = async () => {
      try {
        const data = await verifyEmail(token);

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Помилка підтвердження email");
      }
    };

    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  return (
    <div className="verify-email">
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
        <div className="messageContainer">
          {status === "loading" && (
            <>
              <div className="spinner"></div>
              <h1>Підтвердження email...</h1>
              <p>Будь ласка, зачекайте</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="success-icon">✓</div>
              <h1>Email підтверджено!</h1>
              <p>{message}</p>
              <Link to="/login" className="actionButton">
                Увійти в акаунт
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="error-icon">✗</div>
              <h1>Помилка підтвердження</h1>
              <p>{message}</p>
              <div className="actions">
                <Link to="/register" className="actionButton">
                  Зареєструватися знову
                </Link>
                <Link to="/login" className="actionButton secondary">
                  Спробувати увійти
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}