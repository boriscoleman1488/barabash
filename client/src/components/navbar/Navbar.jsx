import { ArrowDropDown, Notifications } from "@material-ui/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { useContext } from "react";
import { AuthContext } from "../../authContext/AuthContext";
import { logout } from "../../authContext/AuthActions";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, dispatch } = useContext(AuthContext);

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <div className={isScrolled ? "navbar scrolled" : "navbar"}>
      <div className="container">
        <div className="left">
          <h1>BestFlix</h1>
          <Link to="/" className="link">
            <span>Головна</span>
          </Link>
          <Link to="/series" className="link">
            <span className="navbarmainlinks">Серіали</span>
          </Link>
          <Link to="/movies" className="link">
            <span className="navbarmainlinks">Фільми</span>
          </Link>
          <Link to="/genres" className="link">
            <span className="navbarmainlinks">Жанри</span>
          </Link>
          <Link to="/categories" className="link">
            <span className="navbarmainlinks">Категорії</span>
          </Link>
        </div>
        <div className="right">
          <img
            src="https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
            alt=""
          />
          <div className="profile">
            <ArrowDropDown className="icon" />
            <div className="options">
              <Link to="/profile" className="link">
                <span>Профіль</span>
              </Link>
              <span onClick={() => dispatch(logout())}>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;