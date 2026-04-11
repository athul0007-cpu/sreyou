import React, { useEffect, useState, useRef } from 'react';

const MatchingScreen = ({ category, onMatchFound, location }) => {
  const [dots, setDots] = useState('');
  const [prosFoundCount, setProsFoundCount] = useState(0);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 1. Progress Dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 2. Map Initialization
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default to a central-ish coordinate if location is missing (e.g. New York)
    const center = location ? [location.lat, location.lng] : [40.7128, -74.0060];
    
    // Initialize Leaflet Map (Dark Matter Theme)
    const map = L.map(mapRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    // Custom Icon for User (Pulsing Center)
    const userDivIcon = L.divIcon({
      className: 'user-marker-container',
      html: `<div class="user-marker-pulse"></div><div class="user-marker-dot">${category?.icon || '📍'}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(center, { icon: userDivIcon }).addTo(map);

    // Random Pro Markers within ~2km
    const generatePros = () => {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= 5) {
          clearInterval(interval);
          return;
        }
        
        const offsetLat = (Math.random() - 0.5) * 0.02; // Roughly 1-2km
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const proPos = [center[0] + offsetLat, center[1] + offsetLng];
        
        const proIcon = L.divIcon({
          className: 'pro-marker',
          html: `<div class="pro-marker-dot"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        L.marker(proPos, { icon: proIcon }).addTo(map);
        setProsFoundCount(prev => prev + 1);
        count++;
      }, 800);
    };

    generatePros();
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location, category]);

  // 3. Auto-success timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      onMatchFound(null);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [onMatchFound]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0b0e14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0, left: 0,
          opacity: 0.7,
          filter: 'grayscale(0.2) contrast(1.1)'
        }}
      />

      {/* Overlay UI */}
      <div style={{
        position: 'relative',
        zIndex: 2010,
        textAlign: 'center',
        background: 'rgba(11, 14, 20, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '2rem 3rem',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        pointerEvents: 'none'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white', fontWeight: '800' }}>
          Locating {category?.name}{dots}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          Searching for nearby gold-tier pros{dots}
        </p>
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1rem',
          color: 'var(--primary)',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          <span>📍</span>
          <span>{prosFoundCount} Pros Found Nearby</span>
        </div>
      </div>

      <style>{`
        .user-marker-container { position: relative; }
        .user-marker-dot {
          width: 40px; height: 40px;
          background: var(--primary);
          border: 3px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          position: relative; z-index: 2;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .user-marker-pulse {
          position: absolute;
          top: 0; left: 0;
          width: 40px; height: 40px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-out 2s ease-out infinite;
          z-index: 1;
        }
        @keyframes pulse-out {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .pro-marker-dot {
          width: 14px; height: 14px;
          background: #f59e0b;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px #f59e0b;
          animation: fade-in-scale 0.5s ease-out;
        }
        @keyframes fade-in-scale {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .leaflet-container {
          background: #0b0e14 !important;
        }
      `}</style>
    </div>
  );
};

export default MatchingScreen;

