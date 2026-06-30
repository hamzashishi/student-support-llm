// frontend/src/components/ChatBox.jsx

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL;

// ChatBox now receives user and token as props from App.jsx
function ChatBox({ user, token }) {
  const [messages,      setMessages]      = useState([]);
  const [question,      setQuestion]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  const messagesEndRef = useRef(null);

  // ── Check health on mount ─────────────────────────────────
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // ── Auto-scroll to latest message ────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function checkBackendHealth() {
    try {
      const res = await fetch(`${API_URL}/health/`);
      setBackendStatus(res.ok ? 'ok' : 'error');
    } catch {
      setBackendStatus('error');
    }
  }

  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  async function handleSubmit() {
    if (!question.trim()) {
      setError('Please type a question before submitting.');
      return;
    }
    if (backendStatus === 'error') {
      setError('Cannot connect to the server. Make sure Django is running.');
      return;
    }

    const userQuestion = question.trim();

    setMessages(prev => [...prev, {
      role: 'user',
      text: userQuestion,
      time: getCurrentTime()
    }]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      // ── Send token in Authorization header ────────────────
      const res = await fetch(`${API_URL}/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,   // ← AUTH TOKEN
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Token expired — force logout
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer,
        time: getCurrentTime()
      }]);

    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Connection error: Cannot reach the server.');
        setBackendStatus('error');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
return (
 
  <div className="chatbox">

    {backendStatus === 'error' && (
      <div className="status-banner error-banner">
        ⚠️ Cannot connect to the backend.
      </div>
    )}

    {backendStatus === 'ok' && (
      <div className="status-banner ok-banner">
        ✅ Connected — Welcome, {user?.first_name}
      </div>
    )}

    <div className="messages-area">

      {messages.length === 0 && !loading && (
        <div className="empty-state">

          <h3>Hi {user?.first_name}</h3>

          <h1>University Assistant</h1>

          <p>
            Ask anything about university services,
            regulations, fees, registration and more.
          </p>

          <ul className="suggestions">

            <li
              onClick={() =>
                setQuestion('How do I register for courses?')
              }
            >
              How do I register for courses?
            </li>

            <li
              onClick={() =>
                setQuestion('What are the exam rules?')
              }
            >
              What are the exam rules?
            </li>

            <li
              onClick={() =>
                setQuestion('How do I apply for a hostel?')
              }
            >
              How do I apply for a hostel?
            </li>

            <li
              onClick={() =>
                setQuestion('How do I pay my fees?')
              }
            >
              How do I pay my fees?
            </li>

          </ul>

        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
        />
      ))}

      {loading && <LoadingSpinner />}

      <div ref={messagesEndRef} />

    </div>

    {error && (
      <div className="error-message">
        ❌ {error}
      </div>
    )}

    <div className="input-area">

      <textarea
        className="question-input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about registration, exams, fees, library..."
        rows={2}
        disabled={loading}
      />

      <button
        className="send-button"
        onClick={handleSubmit}
        disabled={loading || !question.trim()}
      >
        {loading ? '...' : 'Send'}
      </button>

    </div>

  </div>
);
}
export default ChatBox;
