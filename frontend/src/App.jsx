import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { FiBarChart2, FiUsers, FiTrendingUp } from 'react-icons/fi';
import store from './store/store';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import LogInteractionScreen from './components/LogInteraction/LogInteractionScreen';
import { useTheme } from './hooks/useTheme';
import './index.css';

const headerTitles = {
  'dashboard': 'Dashboard',
  'log-interaction': 'Log Interaction',
  'hcp-directory': 'HCP Directory',
  'analytics': 'Analytics',
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('log-interaction');
  const { theme, toggleTheme } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'log-interaction':
        return <LogInteractionScreen />;
      case 'dashboard':
        return (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiBarChart2 size={48} />
              </div>
              <h3 className="empty-state-title">Dashboard</h3>
              <p className="empty-state-text">Dashboard analytics coming soon. Head to "Log Interaction" to get started.</p>
            </div>
          </div>
        );
      case 'hcp-directory':
        return (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiUsers size={48} />
              </div>
              <h3 className="empty-state-title">HCP Directory</h3>
              <p className="empty-state-text">Full HCP directory is available through the Log Interaction screen.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiTrendingUp size={48} />
              </div>
              <h3 className="empty-state-title">Analytics</h3>
              <p className="empty-state-text">Interaction analytics and insights coming soon.</p>
            </div>
          </div>
        );
      default:
        return <LogInteractionScreen />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        <Header
          title={headerTitles[activeTab] || 'CRM HCP Module'}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className="page-content">
          {renderContent()}
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-emerald)',
              secondary: 'var(--bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--sentiment-negative)',
              secondary: 'var(--bg-elevated)',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
