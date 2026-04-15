import React, { useState } from 'react';

const JobRequestModal = ({ category, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  if (!category) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--modal-overlay)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '0.5rem'
    }}>
      <div className="glass-panel animate-up" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        background: 'var(--modal-bg)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onClose}
          title="Close this modal"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', marginTop: '1rem' }}>{category.icon}</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Request a {category.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Describe your issue and we'll match you shortly.</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if(title && description && address) onSubmit({ title, description, address });
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              Job Name / Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fixing Leaky Kitchen Sink"
              required
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem' }}>
              Describe the Job
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., My kitchen sink is leaking heavily..."
              required
              rows={4}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem' }}>
              Service Address
            </label>
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid rgba(0,0,0,0.1)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            title="Broadcast this job request to nearby professionals"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', boxShadow: '0 4px 14px 0 rgba(30, 109, 94, 0.39)' }}
          >
            Find Nearby Pro
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobRequestModal;
