// components/ai/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI Supply Chain Assistant. I can help you with inventory management, demand forecasting, supplier relationships, and general SCM best practices. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What are the best practices for inventory management?",
    "How can I optimize my supply chain costs?",
    "What should I consider when choosing suppliers?",
    "How do I calculate reorder points?",
    "What are the key SCM performance metrics?",
    "How can I reduce lead times?"
  ];

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.chat(messageText.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response || response.data.fallback_response || 'I apologize, but I couldn\'t process your request right now.',
        timestamp: new Date(),
        metadata: {
          model: response.data.model,
          tokens_used: response.data.tokens_used,
          context_used: response.data.context_used
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Chat cleared! How can I help you with your supply chain management today?',
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-icon">🤖</span>
          <h3>AI Supply Chain Assistant</h3>
        </div>
        <button className="clear-chat-btn" onClick={clearChat} title="Clear chat">
          🗑️
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <div className="message-text">
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
                {message.metadata && (
                  <span className="message-metadata">
                    • {message.metadata.model} • {message.metadata.tokens_used} tokens
                    {message.metadata.context_used && ' • Context used'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <LoadingSpinner size="small" message="Thinking..." />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="quick-questions">
          <h4>Quick Questions:</h4>
          <div className="quick-questions-grid">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about supply chain management..."
            rows="1"
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatBot;