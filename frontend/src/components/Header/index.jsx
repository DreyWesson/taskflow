import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/dashboard">
            <h1>TaskFlow</h1>
          </Link>
        </div>
        
        <div className="header-right">
          {user && (
            <>
              <div className="user-menu">
                <button 
                  className="user-menu-button"
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-label="User menu"
                  data-cy="user-menu-button"
                >
                  <span className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span className="dropdown-icon">▼</span>
                </button>
                
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" data-cy="profile-link">
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item" data-cy="logout-button">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;