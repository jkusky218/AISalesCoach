import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // login | signup
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateDomain = (e) => {
    if (!e.endsWith('@servicenow.com')) {
      setError('Access requires a @servicenow.com email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validateDomain(email)) return;
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email for a confirmation link, then sign in.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      minHeight: '100vh', background: '#0A0E17',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; }
        button { cursor: pointer; }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 380, animation: 'fadeIn 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1A6BF5 0%, #0D4CD4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(26,107,245,0.25)',
            fontSize: 26, fontWeight: 700, color: '#fff',
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1,
          }}>SC</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Sales Craft</h1>
          <p style={{ fontSize: 13, color: '#6B7A99' }}>Pre-Sales Training Simulator</p>
        </div>

        {/* Form */}
        <div style={{
          background: '#111827', border: '1px solid #1E2A42',
          borderRadius: 16, padding: '28px 24px',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#E8ECF4', marginBottom: 20 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7A99', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Joey Kusky" required
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7A99', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@servicenow.com" required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7A99', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={8}
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#DC3545' }}>{error}</p>
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#10B981' }}>{success}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
              background: loading ? '#1E2A42' : 'linear-gradient(135deg, #1A6BF5, #0D4CD4)',
              color: loading ? '#6B7A99' : '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: loading ? 'none' : '0 6px 24px rgba(26,107,245,0.3)',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#4D5E80', textAlign: 'center', marginTop: 18 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#1A6BF5', fontSize: 13, fontWeight: 600, padding: 0 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ fontSize: 11, color: '#2A3348', textAlign: 'center', marginTop: 16, fontFamily: "'JetBrains Mono', monospace" }}>
          @servicenow.com access only
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#0A0E17', border: '1px solid #1E2A42',
  borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#E8ECF4',
  fontFamily: "'DM Sans', sans-serif",
};
