import React, { useEffect, useState } from 'react';

const MatchingScreen = ({ category, onMatchFound }) => {
  const [dots, setDots] = useState('');

  // Simulate progress dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate broadcasting request after 4 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      onMatchFound(null); // Broadcasted successfully, no specific pro returned upfront
    }, 4000);
    return () => clearTimeout(timeout);
  }, [onMatchFound]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      {/* Radar Animation */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'rgba(30, 109, 94, 0.15)',
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(30, 109, 94, 0.25)',
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s'
        }}></div>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
          zIndex: 10,
          boxShadow: '0 10px 30px rgba(30, 109, 94, 0.4)'
        }}>
          {category?.icon || '🔍'}
        </div>
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }} className="animate-up">
        Locating a {category?.name}{dots}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }} className="animate-up delay-1">
        Pinging nearby professionals in your area
      </p>

      {/* Embedded CSS for Ping Animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchingScreen;
