// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ChatBox from './components/ChatBox';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(null);
  const [checking,  setChecking]  = useState(true);  // checking localStorage on startup

  // ── On startup: restore session from localStorage ────────
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser  = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      // Verify the token is still valid by calling /api/auth/me/
      fetch(`${API_URL}/auth/me/`, {
        headers: { 'Authorization': `Token ${savedToken}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Token invalid');
        })
        .then(userData => {
          setToken(savedToken);
          setUser(userData);
        })
        .catch(() => {
          // Token expired or invalid — clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  // ── Called by AuthPage when login/signup succeeds ────────
  function handleLogin(userData, authToken) {
    setUser(userData);
    setToken(authToken);
  }

  // ── Called by ChatBox header logout button ───────────────
  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
    } catch (e) {
      // Even if the request fails, clear local state
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  }

  // ── Loading screen while checking localStorage ───────────
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f1420',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  // ── Show auth page if not logged in ─────────────────────
  if (!user || !token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // ── Show main app if logged in ───────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🎓 University Student Support</h1>
          <p>Ask questions about university services, rules, and procedures</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{user.first_name} {user.last_name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <ChatBox user={user} token={token} />
      </main>

      <footer className="app-footer">
        <p>IS 365 — LLM Application Project | Powered by Llama 3.2</p>
      </footer>
    </div>
  );
}

export default App;
