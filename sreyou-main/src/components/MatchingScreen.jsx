import React, { useEffect, useState } from 'react';

const MatchingScreen = ({ category, onMatchFound }) => {
  const [dots, setDots] = useState('');
  const [prosFound, setProsFound] = useState([]);

  // Simulate progress dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Reveal random "pros" dots over time for radar
  useEffect(() => {
    const interval = setInterval(() => {
      setProsFound(prev => {
        if (prev.length >= 5) return prev;
        return [...prev, {
          id: prev.length,
          top: Math.random() * 70 + 15 + '%',
          left: Math.random() * 70 + 15 + '%',
        }];
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Simulate broadcasting request after 4.5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      onMatchFound(null); // Broadcasted successfully
    }, 4500);
    return () => clearTimeout(timeout);
  }, [onMatchFound]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      {/* Advanced Radar Box */}
      <div style={{
        position: 'relative',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: '#e6f0ed',
        border: '2px solid rgba(30,109,94,0.1)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '3rem',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.05), 0 20px 40px rgba(30,109,94,0.1)'
      }}>
        {/* Radar Map Grids */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px solid rgba(30,109,94,0.15)', borderRadius: '50%', transform: 'scale(0.66)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px solid rgba(30,109,94,0.15)', borderRadius: '50%', transform: 'scale(0.33)' }} />
        <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(30,109,94,0.15)' }} />
        <div style={{ position: 'absolute', height: '1px', width: '100%', background: 'rgba(30,109,94,0.15)' }} />

        {/* Radar Scanner Sweep Effect */}
        <div style={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          top: '0', right: '0',
          transformOrigin: '0% 100%',
          background: 'linear-gradient(90deg, rgba(30,109,94,0) 0%, rgba(30,109,94,0.5) 100%)',
          animation: 'sweep 2s linear infinite',
          zIndex: 5
        }}></div>

        {/* Customer Center Dot (You) */}
        <div style={{
          width: '50px', height: '50px',
          borderRadius: '50%', backgroundColor: 'var(--primary)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', zIndex: 10,
          boxShadow: '0 0 0 6px rgba(255,255,255,0.8), 0 5px 15px rgba(0,0,0,0.2)'
        }}>
          {category?.icon || '📍'}
        </div>

        {/* Pinged Pros markers popping up randomly */}
        {prosFound.map(pro => (
          <div key={pro.id} style={{
            position: 'absolute',
            top: pro.top, left: pro.left,
            width: '14px', height: '14px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            border: '2px solid white',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
            zIndex: 15,
            animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }} />
        ))}
      </div>

      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }} className="animate-up">
        Locating a {category?.name}{dots}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }} className="animate-up delay-1">
        Found {prosFound.length} professionals within 5 km...
      </p>

      {/* Embedded CSS for Complex Animations */}
      <style>{`
        @keyframes sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MatchingScreen;
