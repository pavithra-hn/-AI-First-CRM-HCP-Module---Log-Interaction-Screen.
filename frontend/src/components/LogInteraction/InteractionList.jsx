import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiEdit2, FiTrash2, FiClock, FiUser, FiSmile, FiMeh, FiFrown, FiBox, FiFolder, FiGift } from 'react-icons/fi';
import { openEditModal, deleteInteraction, fetchInteractions } from '../../store/slices/interactionSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SentimentIcon = ({ sentiment }) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return <FiSmile />;
    case 'negative':
      return <FiFrown />;
    default:
      return <FiMeh />;
  }
};

const InteractionList = () => {
  const dispatch = useDispatch();
  const { items: interactions, loading } = useSelector((state) => state.interactions);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await dispatch(deleteInteraction(id)).unwrap();
        toast.success('Interaction deleted');
        dispatch(fetchInteractions());
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy • h:mm a');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h3 className="empty-state-title">No Interactions Yet</h3>
        <p className="empty-state-text">
          Use the form or chat to log your first HCP interaction.
        </p>
      </div>
    );
  }

  return (
    <div className="interaction-list" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      {interactions.map((interaction) => (
        <div key={interaction.id} className="interaction-card">
          <div className="interaction-card-header">
            <div>
              <div className="interaction-card-hcp">
                <FiUser style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.6 }} />
                {interaction.hcp_name || `HCP #${interaction.hcp_id}`}
              </div>
              {interaction.hcp_specialty && (
                <div className="interaction-card-specialty">{interaction.hcp_specialty}</div>
              )}
            </div>
            <div className="interaction-card-date">
              <FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {formatDate(interaction.interaction_date)}
            </div>
          </div>

          {/* Meta badges */}
          <div className="interaction-card-meta">
            <span className="meta-badge type">{interaction.interaction_type}</span>
            {interaction.channel && (
              <span className="meta-badge channel">{interaction.channel}</span>
            )}
            {interaction.sentiment && (
              <span className={`meta-badge sentiment-${interaction.sentiment.toLowerCase()}`}>
                <SentimentIcon sentiment={interaction.sentiment} />
                {' '}{interaction.sentiment}
              </span>
            )}
          </div>

          {/* Summary */}
          {(interaction.ai_summary || interaction.notes) && (
            <p className="interaction-card-summary">
              {interaction.ai_summary || interaction.notes?.substring(0, 150) + '...'}
            </p>
          )}

          {/* Attendees */}
          {interaction.attendees && interaction.attendees.length > 0 && (
            <div className="interaction-card-summary" style={{ marginBottom: 'var(--space-2)', fontSize: '0.8rem' }}>
              <FiUser style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle', opacity: 0.6 }} />
              {interaction.attendees.join(', ')}
            </div>
          )}

          {/* Product tags */}
          {interaction.products_discussed && interaction.products_discussed.length > 0 && (
            <div className="interaction-card-tags">
              {interaction.products_discussed.map((product, i) => (
                <span key={i} className="tag"><FiBox style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} /> {product}</span>
              ))}
            </div>
          )}

          {/* Materials shared */}
          {interaction.materials_shared && interaction.materials_shared.length > 0 && (
            <div className="interaction-card-tags">
              {interaction.materials_shared.map((m, i) => (
                <span key={i} className="chip chip-material"><FiFolder style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} /> {m}</span>
              ))}
            </div>
          )}

          {/* Samples distributed */}
          {interaction.samples_distributed && interaction.samples_distributed.length > 0 && (
            <div className="interaction-card-tags">
              {interaction.samples_distributed.map((s, i) => (
                <span key={i} className="chip chip-sample"><FiGift style={{ width: 12, height: 12, marginRight: 4, verticalAlign: 'middle' }} /> {s}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="interaction-card-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch(openEditModal(interaction))}
            >
              <FiEdit2 /> Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(interaction.id)}
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractionList;
