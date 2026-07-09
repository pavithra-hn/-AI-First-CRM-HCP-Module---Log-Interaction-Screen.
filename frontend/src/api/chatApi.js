import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  sendMessage: (message, conversationId = null) => {
    return api.post('/chat', {
      message,
      conversation_id: conversationId,
    });
  },
  clearConversation: (conversationId) => {
    return api.delete(`/chat/${conversationId}`);
  },
};

export default chatApi;
