import { useRef, useEffect } from "react"; // Add useEffect import
import { useState } from "react";
import "./Register.scss";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const emailRef = useRef();
  const passwordRef = useRef();
  const usernameRef = useRef();

  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log("sign in");
    navigate("/login");
  };

  const handleStart = () => {
    setEmail(emailRef.current.value);
  };
  const handleFinish = async (e) => {
    e.preventDefault();
    setUsername(usernameRef.current.value);
    setPassword(passwordRef.current.value);
  };

  useEffect(() => {
    // Trigger post request when username and password are updated
    if (username && password) {
      const postData = async () => {
        try {
          await axios.post("http://localhost:5000/api/auth/register", {
            email,
            password,
            username,
          });
          navigate("/login");
        } catch (err) {
          console.log(err);
        }
      };
      postData();
    }
  }, [navigate, email, username, password]);

  return (
    <div className="register">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt=""
          />
        </div>
      </div>

      <div className="container">
        <h1>Unlimited movies, TV shows, and more.</h1>
        <h2>Watch anywhere. Cancel anytime.</h2>
        <p>
          Ready to watch? Enter your email to create or restart your membership.
        </p>
        {!email ? (
          <div className="input">
            <input type="email" placeholder="email address" ref={emailRef} />
            <button className="registerButton" onClick={handleStart}>
              Get Started
            </button>
            <button className="registerButton2" onClick={handleSignIn}>
              Sign In
            </button>
          </div>
        ) : (
          <form className="input">
            <input type="text" placeholder="username" ref={usernameRef} />
            <input type="password" placeholder="password" ref={passwordRef} />
            <button className="registerButton" onClick={handleFinish}>
              Start
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
