import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ServicerDashboard = ({ currentUser, onLogout }) => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const resA = await fetch(`${API_URL}/api/jobs/available`);
      const dataA = await resA.json();
      setAvailableJobs(dataA);

      const resM = await fetch(`${API_URL}/api/users/${currentUser.id}/jobs?role=servicer`);
      const dataM = await resM.json();
      setMyJobs(dataM);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Polling for new jobs
    return () => clearInterval(interval);
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
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0}}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1, color: 'var(--primary)' }}>SreYou</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Servicer Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: '600' }}>{currentUser.name}</span>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={onLogout} title="Sign out of your servicer account">Logout</button>
        </div>
      </header>

      <main style={{ padding: '2rem', flex: 1 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Job Requests</h2>
        
        {availableJobs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No jobs currently available nearby.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {availableJobs.map(job => (
              <div key={job.id} className="glass-panel animate-up" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{job.category}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Requested by {job.customer_name}</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{job.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Pending</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myJobs.map(job => (
               <div key={job.id} className="glass-panel animate-up" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{job.category} - {job.customer_name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{job.description}</p>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    Accepted
                  </div>
               </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicerDashboard;
