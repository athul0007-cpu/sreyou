import React from 'react';

const Hero = () => {
  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.85)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Header Image matching the style */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        height: '100%', width: '50%',
        background: 'url("https://images.unsplash.com/photo-1541889028637-bf482eaee050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") center/cover',
        maskImage: 'linear-gradient(to right, transparent, black)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%'}}>
        <h1 className="animate-up" style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'var(--text-primary)',
          lineHeight: '1.2'
        }}>
          ServeConnect Main Dashboard
        </h1>
        
        <div className="animate-up delay-1" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{
            background: 'var(--bg-color)',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: 'var(--primary)',
            fontWeight: '600'
          }}>🟢 Online Activity</span>
          <span style={{
            background: 'rgba(0,0,0,0.05)',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}>Connections: 192819210</span>
        </div>

        <div className="animate-up delay-2" style={{
          display: 'flex',
          gap: '2.5rem',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          paddingTop: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <div>
            <div style={{fontWeight: '700', fontSize: '1.1rem'}}>4029 ↗</div>
            <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Tasks Run</div>
          </div>
          <div>
            <div style={{fontWeight: '700', fontSize: '1.1rem'}}>VM0038</div>
            <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Methodology</div>
          </div>
          <div>
            <div style={{fontWeight: '700', fontSize: '1.1rem'}}>San Francisco, CA</div>
            <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Location</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
