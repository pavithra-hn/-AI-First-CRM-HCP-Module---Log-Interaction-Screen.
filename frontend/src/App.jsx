import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import LogInteractionScreen from './components/LogInteraction/LogInteractionScreen';
import Dashboard from './components/Dashboard/Dashboard';
import HCPDirectory from './components/HCPDirectory/HCPDirectory';
import Analytics from './components/Analytics/Analytics';
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
        return <Dashboard />;
      case 'hcp-directory':
        return <HCPDirectory />;
      case 'analytics':
        return <Analytics />;
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
