import React from 'react';
import { FiBell, FiUser, FiSun, FiMoon } from 'react-icons/fi';

const Header = ({ title, theme, onToggleTheme }) => {
  return (
    <header className="header">
      <h2 className="header-title">{title}</h2>
      <div className="header-actions">
        <div className="header-badge">
          <span className="dot"></span>
          AI Agent Online
        </div>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        <button className="btn-icon" title="Notifications">
          <FiBell />
        </button>
        <button className="btn-icon" title="Profile">
          <FiUser />
        </button>
      </div>
    </header>
  );
};

export default Header;
