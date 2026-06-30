// frontend/src/components/AuthPage.jsx

import { useState } from 'react';
import './AuthPage.css';

const API_URL = process.env.REACT_APP_API_URL;

function AuthPage({ onLogin }) {
  const [tab, setTab]         = useState('signup');   // 'signup' | 'login'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── Signup fields ──
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [sEmail,    setSEmail]    = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sShowPass, setSShowPass] = useState(false);

  // ── Login fields ──
  const [lEmail,    setLEmail]    = useState('');
  const [lPassword, setLPassword] = useState('');
  const [lShowPass, setLShowPass] = useState(false);

  // ── Field-level errors ──
  const [fieldErrors, setFieldErrors] = useState({});

  function clearErrors() {
    setError('');
    setFieldErrors({});
  }

  function switchTab(t) {
    setTab(t);
    clearErrors();
  }

  // ── SIGNUP ───────────────────────────────────────────────
  async function handleSignup() {
    clearErrors();
    const errs = {};

    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim())  errs.lastName  = 'Last name is required.';
    if (!sEmail.trim() || !sEmail.includes('@')) errs.sEmail = 'Enter a valid email.';
    if (sPassword.length < 8) errs.sPassword = 'At least 8 characters.';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      sEmail.trim().toLowerCase(),
          password:   sPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user',  JSON.stringify(data.user));

      // Tell App.jsx the user is now logged in
      onLogin(data.user, data.token);

    } catch (err) {
      setError('Cannot connect to the server. Make sure Django is running.');
    } finally {
      setLoading(false);
    }
  }

  // ── LOGIN ────────────────────────────────────────────────
  async function handleLogin() {
    clearErrors();
    const errs = {};

    if (!lEmail.trim() || !lEmail.includes('@')) errs.lEmail = 'Enter a valid email.';
    if (!lPassword) errs.lPassword = 'Password is required.';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    lEmail.trim().toLowerCase(),
          password: lPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user',  JSON.stringify(data.user));

      onLogin(data.user, data.token);

    } catch (err) {
      setError('Cannot connect to the server. Make sure Django is running.');
    } finally {
      setLoading(false);
    }
  }

  // ── Allow Enter key to submit ────────────────────────────
  function handleKeyDown(e, action) {
    if (e.key === 'Enter') action();
  }

  return (
    <div className="auth-root">
      <div className="auth-bg" />

      {/* ── Nav ── */}
      <nav className="auth-nav">
        <div className="auth-logo">
          <div className="logo-dot">🎓</div>
          UniSupport
        </div>
        <div className="auth-nav-links">
          <span onClick={() => switchTab('signup')}>Home</span>
          <span onClick={() => switchTab('login')}>Join</span>
        </div>
      </nav>

      {/* ── Panel ── */}
      <div className="auth-panel">

        {/* ── Tab switch ── */}
        <div className="tab-switch">
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Create account
          </button>
          <button
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Log in
          </button>
        </div>

        {/* ── Global error ── */}
        {error && (
          <div className="auth-error">
            ❌ {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SIGNUP FORM
        ══════════════════════════════════════════════════ */}
        {tab === 'signup' && (
          <div className="auth-form">
            <div className="auth-eyebrow">Start for </div>
            <div className="auth-title">
              Create new account<span className="auth-dot">.</span>
            </div>
            <div className="auth-sub">
              Already a member?{' '}
              <span className="auth-link" onClick={() => switchTab('login')}>
                Log in
              </span>
            </div>

            {/* First + Last name row */}
            <div className="field-row">
              <div className="field-wrap">
                <label className="field-label">First name</label>
                <div className="field-input-wrap">
                  <input
                    className={`field-input ${fieldErrors.firstName ? 'input-err' : ''}`}
                    placeholder="Said"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleSignup)}
                  />
                  <span className="field-icon">👤</span>
                </div>
                {fieldErrors.firstName && (
                  <div className="err-msg">{fieldErrors.firstName}</div>
                )}
              </div>

              <div className="field-wrap">
                <label className="field-label">Last name</label>
                <div className="field-input-wrap">
                  <input
                    className={`field-input ${fieldErrors.lastName ? 'input-err' : ''}`}
                    placeholder="Shishi"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleSignup)}
                  />
                  <span className="field-icon">👤</span>
                </div>
                {fieldErrors.lastName && (
                  <div className="err-msg">{fieldErrors.lastName}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="field-wrap" style={{ marginBottom: '14px' }}>
              <label className="field-label">Email</label>
              <div className="field-input-wrap">
                <input
                  className={`field-input ${fieldErrors.sEmail ? 'input-err' : ''}`}
                  placeholder="said@university.ac"
                  type="email"
                  value={sEmail}
                  onChange={e => setSEmail(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, handleSignup)}
                />
                <span className="field-icon">✉️</span>
              </div>
              {fieldErrors.sEmail && (
                <div className="err-msg">{fieldErrors.sEmail}</div>
              )}
            </div>

            {/* Password */}
            <div className="field-wrap" style={{ marginBottom: '6px' }}>
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input
                  className={`field-input ${fieldErrors.sPassword ? 'input-err' : ''}`}
                  placeholder="••••••••"
                  type={sShowPass ? 'text' : 'password'}
                  value={sPassword}
                  onChange={e => setSPassword(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, handleSignup)}
                />
                <span
                  className="field-icon clickable"
                  onClick={() => setSShowPass(!sShowPass)}
                  title={sShowPass ? 'Hide password' : 'Show password'}
                >
                  {sShowPass ? '🙈' : '👁️'}
                </span>
              </div>
              {fieldErrors.sPassword && (
                <div className="err-msg">{fieldErrors.sPassword}</div>
              )}
            </div>

            {/* Buttons */}
            <div className="auth-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setFirstName(''); setLastName('');
                  setSEmail(''); setSPassword('');
                  clearErrors();
                }}
              >
                Clear form
              </button>
              <button
                className="btn-primary"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>

            <div className="auth-divider"><span>or continue with</span></div>
            <div className="social-btns">
              <button className="btn-social">🌐 Google</button>
              <button className="btn-social">🐙 GitHub</button>
              <button className="btn-social">🪪 Student ID</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            LOGIN FORM
        ══════════════════════════════════════════════════ */}
        {tab === 'login' && (
          <div className="auth-form">
            <div className="auth-eyebrow">Welcome back</div>
            <div className="auth-title">
              Log in to your<span className="auth-dot"> account.</span>
            </div>
            <div className="auth-sub">
              No account yet?{' '}
              <span className="auth-link" onClick={() => switchTab('signup')}>
                Sign up 
              </span>
            </div>

            {/* Email */}
            <div className="field-wrap" style={{ marginBottom: '14px' }}>
              <label className="field-label">Email</label>
              <div className="field-input-wrap">
                <input
                  className={`field-input ${fieldErrors.lEmail ? 'input-err' : ''}`}
                  placeholder="said@university.ac"
                  type="email"
                  value={lEmail}
                  onChange={e => setLEmail(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, handleLogin)}
                />
                <span className="field-icon">✉️</span>
              </div>
              {fieldErrors.lEmail && (
                <div className="err-msg">{fieldErrors.lEmail}</div>
              )}
            </div>

            {/* Password */}
            <div className="field-wrap" style={{ marginBottom: '6px' }}>
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input
                  className={`field-input ${fieldErrors.lPassword ? 'input-err' : ''}`}
                  placeholder="••••••••"
                  type={lShowPass ? 'text' : 'password'}
                  value={lPassword}
                  onChange={e => setLPassword(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, handleLogin)}
                />
                <span
                  className="field-icon clickable"
                  onClick={() => setLShowPass(!lShowPass)}
                  title={lShowPass ? 'Hide password' : 'Show password'}
                >
                  {lShowPass ? '🙈' : '👁️'}
                </span>
              </div>
              {fieldErrors.lPassword && (
                <div className="err-msg">{fieldErrors.lPassword}</div>
              )}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <span className="auth-link" style={{ fontSize: '12px' }}>
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <div className="auth-actions">
              <button
                className="btn-primary"
                onClick={handleLogin}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>

            <div className="auth-divider"><span>or continue with</span></div>
            <div className="social-btns">
              <button className="btn-social">🌐 Google</button>
              <button className="btn-social">🐙 GitHub</button>
              <button className="btn-social">🪪 Student ID</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
