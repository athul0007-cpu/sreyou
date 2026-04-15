import React, { useEffect, useState, useRef } from 'react';
import { API_URL } from '../config';

const MatchingScreen = ({ category, onMatchFound, onCancel, location, theme }) => {
  const [dots, setDots] = useState('');
  const [realProCount, setRealProCount] = useState(0);
  const [visualMarkers, setVisualMarkers] = useState(0);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 1. Progress Dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch real pro count
  useEffect(() => {
    fetch(`${API_URL}/api/users/count-servicers`)
      .then(res => res.json())
      .then(data => setRealProCount(data.count || 0))
      .catch(() => setRealProCount(0));
  }, []);

  // 3. Map Initialization (Default to Kochi, Kerala)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Center on Kochi if location is missing
    const center = location ? [location.lat, location.lng] : [9.9312, 76.2673];
    
    const map = L.map(mapRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 20
    }).addTo(map);

    // Privacy-Safe View: Only show Customer's location
    const userDivIcon = L.divIcon({
      className: 'user-marker-container',
      html: `<div class="user-marker-pulse"></div><div class="user-marker-dot">${category?.icon || '📍'}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(center, { icon: userDivIcon }).addTo(map);

    // Add randomized simulated pulses to show activity WITHOUT revealing real pro locations (Privacy)
    const addVisualPulse = () => {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= 4) {
          clearInterval(interval);
          return;
        }
        
        const offsetLat = (Math.random() - 0.5) * 0.03;
        const offsetLng = (Math.random() - 0.5) * 0.03;
        const pos = [center[0] + offsetLat, center[1] + offsetLng];
        
        const pulseIcon = L.divIcon({
          className: 'pro-pulse',
          html: `<div class="pro-pulse-dot"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        L.marker(pos, { icon: pulseIcon }).addTo(map);
        setVisualMarkers(prev => prev + 1);
        count++;
      }, 1200);
    };

    addVisualPulse();
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location, category, theme]);

  // 4. Stay on screen longer to feel like a real search
  useEffect(() => {
    const timeout = setTimeout(() => {
      onMatchFound(null);
    }, 12000); 
    return () => clearTimeout(timeout);
  }, [onMatchFound]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div 
        ref={mapRef} 
        style={{
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0, left: 0,
          opacity: 0.6,
          filter: 'grayscale(0.3) contrast(1.1)'
        }}
      />

      {/* Overlay UI */}
      <div style={{
        position: 'relative',
        zIndex: 2010,
        textAlign: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        width: '85%',
        maxWidth: '380px',
        pointerEvents: 'auto'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white', fontWeight: '800' }}>
          Broadcasting{dots}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Finding gold-tier {category?.name} pros nearby
        </p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          padding: '1rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
             {realProCount} Pros Registered in Zone
          </div>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
             Exact locations hidden for privacy 🛡️
          </div>
        </div>

        <button 
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: '2px solid var(--glass-border)',
            color: '#ef4444',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          Cancel Request
        </button>
      </div>

      <style>{`
        .user-marker-pulse {
          position: absolute;
          width: 40px; height: 40px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-out 2s ease-out infinite;
        }
        .user-marker-dot {
          width: 40px; height: 40px;
          background: var(--primary);
          border: 3px solid var(--glass-border);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          position: relative; z-index: 2;
        }
        @keyframes pulse-out {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(4); opacity: 0; }
        }
        .pro-pulse-dot {
          width: 10px; height: 10px;
          background: #f59e0b;
          border-radius: 50%;
          box-shadow: 0 0 15px #f59e0b;
          animation: flicker 1.5s infinite alternate;
        }
        @keyframes flicker {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        .leaflet-container { background: #0b0e14 !important; }
      `}</style>
    </div>
  );
};

export default MatchingScreen;


