import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <div 
      onClick={toggleTheme} 
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        background: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
        color: theme === 'light' ? '#475569' : '#f8fafc',
        transition: 'all 0.3s ease',
        fontSize: '1.2rem',
        border: '1px solid var(--glass-border)',
        marginRight: '0.5rem'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span>{theme === 'light' ? '🌙' : '☀️'}</span>
    </div>
  );
};

export default ThemeToggle;
