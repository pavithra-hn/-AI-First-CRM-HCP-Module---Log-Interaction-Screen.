import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit3, FiList, FiActivity, FiCpu } from 'react-icons/fi';
import FormMode from './FormMode';
import ChatMode from './ChatMode';
import InteractionList from './InteractionList';
import EditInteractionModal from './EditInteractionModal';
import { fetchInteractions } from '../../store/slices/interactionSlice';
import { fetchHCPs } from '../../store/slices/hcpSlice';

const LogInteractionScreen = () => {
  const [showList, setShowList] = useState(false);
  const dispatch = useDispatch();
  const { editModalOpen, items: interactions } = useSelector((state) => state.interactions);

  useEffect(() => {
    dispatch(fetchInteractions());
    dispatch(fetchHCPs());
  }, [dispatch]);

  return (
    <div>
      {/* Page heading + controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Log HCP Interaction
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Capture an interaction with a structured form, or just describe it to the AI assistant.
          </p>
        </div>

        <button
          className={`btn ${showList ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowList(!showList)}
        >
          <FiList />
          {showList ? 'Hide' : 'View'} Interactions
          {interactions.length > 0 && (
            <span style={{
              background: showList ? 'rgba(255,255,255,0.25)' : 'var(--accent-soft-bg)',
              borderRadius: '9999px', padding: '1px 8px', fontSize: '0.7rem',
              fontWeight: 700, minWidth: 20, textAlign: 'center',
            }}>
              {interactions.length}
            </span>
          )}
        </button>
      </div>

      {/* Two-panel layout: Interaction Details + AI Assistant */}
      <div className="log-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: structured form */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title"><FiEdit3 /> Interaction Details</h3>
          </div>
          <FormMode />
        </div>

        {/* Right: AI chat assistant */}
        <div className="glass-card" style={{ position: 'sticky', top: '80px' }}>
          <div className="glass-card-header">
            <div>
              <h3 className="glass-card-title"><FiCpu /> AI Assistant</h3>
              <div className="glass-card-subtitle">Log interaction via chat</div>
            </div>
            <div className="ai-status-pill">
              <span className="live-dot" />
              LangGraph + Groq
            </div>
          </div>
          <ChatMode />
        </div>
      </div>

      {/* Interactions list (toggle) */}
      {showList && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <div className="glass-card-header">
            <h3 className="glass-card-title"><FiActivity /> Recent Interactions</h3>
            <span className="count-pill">{interactions.length} logged</span>
          </div>
          <InteractionList />
        </div>
      )}

      {editModalOpen && <EditInteractionModal />}
    </div>
  );
};

export default LogInteractionScreen;
