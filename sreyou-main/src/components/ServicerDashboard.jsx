import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import JobChat from './JobChat';
import ThemeToggle from './ThemeToggle';

const ServicerDashboard = ({ currentUser, onLogout, theme, toggleTheme }) => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeChatJob, setActiveChatJob] = useState(null);
  const [showMap, setShowMap] = useState(true);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  const fetchJobs = async () => {
    try {
      const resA = await fetch(`${API_URL}/api/jobs/available`);
      const dataA = await resA.json();
      setAvailableJobs(dataA);

      const resM = await fetch(`${API_URL}/api/users/${currentUser.id}/jobs?role=servicer`);
      const dataM = await resM.json();
      setMyJobs(dataM);

      const resR = await fetch(`${API_URL}/api/users/${currentUser.id}/reviews`);
      const dataR = await resR.json();
      setReviews(dataR);
    } catch(err) {
      console.error(err);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 'No ratings yet';

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Map Lifecycle
  useEffect(() => {
    if (!showMap || !mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0], // Default global zoom, will auto-fit later
      zoom: 2,
      zoomControl: true,
      attributionControl: false
    });

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 20
    }).addTo(map);

    markersGroup.current = L.featureGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showMap, theme]);

  // Update markers when availableJobs change
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    markersGroup.current.clearLayers();
    const jobsWithCoords = availableJobs.filter(j => j.lat && j.lng);

    jobsWithCoords.forEach(job => {
      const icon = L.divIcon({
        className: 'job-marker',
        html: `<div class="job-marker-pin"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([job.lat, job.lng], { icon })
        .bindPopup(`<strong>${job.category}</strong><br/>${job.customer_name}<br/><button class="map-btn" onclick="document.dispatchEvent(new CustomEvent('acceptJob', {detail: ${job.id}}))">Accept Job</button>`);
      
      markersGroup.current.addLayer(marker);
    });

    if (jobsWithCoords.length > 0) {
      mapInstance.current.fitBounds(markersGroup.current.getBounds(), { padding: [50, 50], maxZoom: 13 });
    }
  }, [availableJobs, showMap]);

  // Handle job acceptance from map popup
  useEffect(() => {
    const handleMapAccept = (e) => handleAcceptJob(e.detail);
    document.addEventListener('acceptJob', handleMapAccept);
    return () => document.removeEventListener('acceptJob', handleMapAccept);
  }, []);

  const handleAcceptJob = async (jobId) => {
    try {
      await fetch(`${API_URL}/api/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicer_id: currentUser.id, servicer_name: currentUser.name })
      });
      fetchJobs();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container servicer-view" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top-header">
        <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0}}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1, color: 'var(--primary)' }}>SreYou</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Servicer Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: '600', display: 'block', fontSize: '0.9rem' }}>{currentUser.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {avgRating}</span>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={onLogout} title="Sign out of your servicer account">Logout</button>
        </div>
      </header>

      <main className="view-container" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>Available Jobs</h2>
          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowMap(!showMap)}>
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        
        {showMap && (
           <div className="glass-panel" style={{ height: '300px', marginBottom: '2rem', overflow: 'hidden', padding: 0, border: '1px solid var(--glass-border)' }}>
              <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />
              <style>{`
                .leaflet-container { height: 100%; width: 100%; border-radius: 12px; }
              `}</style>
           </div>
        )}

        {availableJobs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No jobs currently available nearby.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {availableJobs.map(job => (
              <div key={job.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>{job.title || job.category}</h3>
                  {job.distance_km && (
                    <span style={{ background: 'rgba(30,109,94,0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                       {job.distance_km} km away
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Category: {job.category}</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Requested by {job.customer_name}</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{job.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.85rem' }}>Open Request</span>
                  <button className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }} onClick={() => handleAcceptJob(job.id)} title={`Accept this ${job.category} job request from ${job.customer_name}`}>Accept Job</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '1.5rem', marginTop: '3rem', marginBottom: '1.5rem' }}>My Active Jobs</h2>
        
        {myJobs.length === 0 ? (
          <div className="glass-panel animate-up" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You have no active jobs right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myJobs.map(job => (
               <div key={job.id} className="glass-panel animate-up" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>{job.title || job.category}</h3>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.25rem' }}>📍 {job.address}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Customer: {job.customer_name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{job.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      {job.status}
                    </div>
                    {job.status === 'accepted' && (
                      <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setActiveChatJob(job)}>
                        Message
                      </button>
                    )}
                  </div>
               </div>
            ))}
          </div>
        )}
      </main>

      {activeChatJob && (
        <JobChat job={activeChatJob} currentUser={currentUser} onClose={() => setActiveChatJob(null)} />
      )}

      <style>{`
        .job-marker-pin {
          width: 20px;
          height: 20px;
          background: #f59e0b;
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        .map-btn {
          margin-top: 8px;
          padding: 5px 10px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ServicerDashboard;
