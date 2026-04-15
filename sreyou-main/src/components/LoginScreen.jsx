import React, { useState } from 'react';
import { API_URL } from '../config';
import { supabase } from '../supabase';
import ThemeToggle from './ThemeToggle';

const LoginScreen = ({ onLogin, theme, toggleTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (isRegistering && !username) {
      setError('Username is required for new accounts');
      return;
    }

    try {
      let authUser;
      
      if (isRegistering) {
        // 1. Sign up with Supabase Auth
        const { data, error: authErr } = await supabase.auth.signUp({
          email, 
          password,
          options: { data: { full_name: name || username } }
        });
        
        if (authErr) {
          // If user exists but sync failed previously, try to sign in
          if (authErr.message.toLowerCase().includes('already registered')) {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
            if (signInErr) throw authErr;
            authUser = signInData.user;
          } else {
            throw authErr;
          }
        } else {
          authUser = data.user;
        }
      } else {
        // 2. Sign in with Supabase Auth
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email, password
        });
        if (authErr) throw authErr;
        authUser = data.user;
      }

      if (!authUser) throw new Error("Authentication failed");

      // 3. Sync with our custom profile table
      const res = await fetch(`${API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: authUser.id, 
          username: username || email.split('@')[0], 
          name: name || authUser.user_metadata?.full_name || username || email.split('@')[0], 
          role: role 
        })
      });
      
      const syncData = await res.json();
      if (!res.ok) throw new Error(syncData.error || 'Profile sync failed');

      onLogin(syncData.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <div className="glass-panel animate-up" style={{
        maxWidth: '450px', width: '90%', textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: 'var(--primary)' }}>SreYou</h1>
          <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Service For You
          </p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isRegistering ? 'Create an Account' : 'Sign In to Your Account'}
        </h2>

        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }} />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }} placeholder="alex@example.com" required />
          </div>

          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }} placeholder="alex_pro" required />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }} required />
          </div>

          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>I am a...</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }}>
                <option value="customer">Customer (Looking for services)</option>
                <option value="servicer">Servicer (Looking for work)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} title={isRegistering ? "Register a new SreYou account" : "Log into your SreYou account"}>
            {isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Sign In' : 'Create one'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
