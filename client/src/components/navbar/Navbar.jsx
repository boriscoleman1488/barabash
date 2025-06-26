import { ArrowDropDown, Notifications } from "@material-ui/icons";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { AuthContext } from "../../authContext/AuthContext";
import { logout } from "../../authContext/AuthActions";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, dispatch } = useContext(AuthContext);

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return (user?.username?.[0] || 'U').toUpperCase();
  };

  return (
    <div className={isScrolled ? "navbar scrolled" : "navbar"}>
      <div className="container">
        <div className="left">
          <h1>BestFlix</h1>
          <Link to="/" className="link">
            <span>Головна</span>
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
          <div className="user-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              <span className="avatar-initials">{getUserInitials()}</span>
            )}
          </div>
          <div className="profile">
            <ArrowDropDown className="icon" />
            <div className="options">
              <Link to="/profile" className="link">
                <span>Профіль</span>
              </Link>
              <span onClick={() => dispatch(logout())}>Вийти</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;