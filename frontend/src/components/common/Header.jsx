// components/common/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ title }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">{title || 'SCM Dashboard'}</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">
              {user?.first_name || user?.username || 'User'}
            </span>
            <span className="user-role">({user?.role || 'user'})</span>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;