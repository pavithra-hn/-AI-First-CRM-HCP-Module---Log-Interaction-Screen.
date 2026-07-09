import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSend, FiTrash2, FiCpu, FiUser, FiZap, FiMessageSquare } from 'react-icons/fi';
import { addUserMessage, sendMessage, clearChat } from '../../store/slices/chatSlice';
import { fetchInteractions } from '../../store/slices/interactionSlice';

const ChatMode = () => {
  const dispatch = useDispatch();
  const { messages, conversationId, loading } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickSuggestions = [
    { text: "Log a visit with Dr. Sarah Mitchell about CardioGuard XR", icon: <FiMessageSquare /> },
    { text: "Look up cardiologists in the database", icon: <FiUser /> },
    { text: "Analyze sentiment of interaction #1", icon: <FiCpu /> },
    { text: "Edit interaction #1 — change follow-up date", icon: <FiZap /> },
    { text: "Suggest follow-up for HCP ID 2", icon: <FiZap /> },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    dispatch(addUserMessage(userMessage));
    await dispatch(sendMessage({ message: userMessage, conversationId }));
    dispatch(fetchInteractions());

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-container">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10a10 10 0 0 1-4.65-1.15L2 22l1.15-5.35A10 10 0 0 1 2 12 10 10 0 0 1 12 2z"/>
                <circle cx="8" cy="12" r="0.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
                <circle cx="16" cy="12" r="0.5" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="empty-state-title">AI CRM Assistant</h3>
            <p className="empty-state-text">
              I can help you log interactions, look up HCPs, analyze sentiment, and suggest follow-ups.
              Try one of the suggestions below or type your own message.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'user' ? <FiUser /> : <FiCpu />}
            </div>
            <div className="chat-bubble">
              {msg.toolUsed && (
                <div className="tool-badge">
                  <FiZap style={{ width: 12, height: 12 }} /> {msg.toolUsed}
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="chat-message assistant">
            <div className="chat-avatar">
              <FiCpu />
            </div>
            <div className="chat-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 0 && (
        <div className="quick-suggestions">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="quick-suggestion"
              onClick={() => handleSuggestionClick(suggestion.text)}
            >
              {suggestion.icon}
              <span style={{ marginLeft: 6 }}>{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input-container">
        {messages.length > 0 && (
          <button
            className="btn-icon"
            onClick={() => dispatch(clearChat())}
            title="Clear conversation"
            style={{ flexShrink: 0 }}
          >
            <FiTrash2 />
          </button>
        )}
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Type your message... (e.g., 'Log a visit with Dr. Mitchell')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          title="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatMode;
