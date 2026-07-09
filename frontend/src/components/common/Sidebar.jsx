import React from 'react';
import { FiHome, FiMessageSquare, FiUsers, FiActivity, FiSettings, FiZap } from 'react-icons/fi';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'log-interaction', label: 'Log Interaction', icon: <FiMessageSquare /> },
    { id: 'hcp-directory', label: 'HCP Directory', icon: <FiUsers /> },
    { id: 'analytics', label: 'Analytics', icon: <FiActivity /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <FiZap />
        </div>
        <div>
          <h1>CRM HCP</h1>
          <span>AI-First Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>AI-First CRM v1.0</p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>Powered by LangGraph + Groq</p>
      </div>
    </aside>
  );
};

export default Sidebar;
