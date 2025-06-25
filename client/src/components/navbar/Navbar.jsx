import { ArrowDropDown, Notifications, Search } from "@material-ui/icons";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../authContext/AuthContext";
import { logout } from "../../authContext/apiCalls";
import "./Navbar.scss";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, dispatch } = useContext(AuthContext);

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  const handleLogout = () => {
    logout(dispatch);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <div className={isScrolled ? "navbar scrolled" : "navbar"}>
      <div className="container">
        <div className="left">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="BestFlix"
          />
          <Link to="/" className="link">
            <span>Головна</span>
          </Link>
          <Link to="/series" className="link">
            <span>Серіали</span>
          </Link>
          <Link to="/movies" className="link">
            <span>Фільми</span>
          </Link>
          <span>Новинки та популярне</span>
          <span>Мій список</span>
        </div>
        <div className="right">
          <Search className="icon" />
          <span>ДИТЯЧІ</span>
          <Notifications className="icon" />
          <div className="profile" onClick={toggleProfileMenu}>
            <img
              src={user?.profilePicture || "https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"}
              alt="Profile"
            />
            <ArrowDropDown className="icon" />
            {showProfileMenu && (
              <div className="options">
                <div className="profile-info">
                  <span className="username">{user?.username}</span>
                  <span className="email">{user?.email}</span>
                </div>
                <div className="divider"></div>
                <span>Налаштування</span>
                <span onClick={handleLogout}>Вийти з BestFlix</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;