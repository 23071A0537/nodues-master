import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userJson = sessionStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserEmail(user.email || null);
      } catch {
        setUserEmail(null);
      }
    }
  }, [location.pathname]); // ✅ runs whenever route changes

  const handleLogout = () => {
    sessionStorage.clear();
    setUserEmail(null);
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="header-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/en/e/e5/Official_logo_of_VNRVJIET.png"
          className="header-logo"
          alt="College Logo"
        />
        <div className="header-text">
          <h1 className="header-title">
            VNR Vignana Jyothi Institute of Engineering & Technology - VNRVJIET
          </h1>
          <p className="header-address">
            Pragathi Nagar, Nizampet (S.O), Hyderabad, Telangana, India - 500090
          </p>
        </div>
      </div>

      {isLoggedIn && (
        <div className="header-right">
          <div className="header-info" title={userEmail || "Logged in user"}>
            <FaUserCircle size={32} className="profile-icon" />
            {userEmail && <span className="user-email">{userEmail}</span>}
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <FaSignOutAlt size={20} /> Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
