import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

// Separate Tab Views to keep App.jsx clean

export const HistoryTab = ({ currentUser }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/api/users/${currentUser.id}/jobs?role=customer`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  return (
    <div className="glass-panel animate-up" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Service History</h2>
      
      {history.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ marginTop: '2rem', marginBottom: '2rem' }}>You have no service history yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map(job => (
            <div key={job.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1.5rem', background: 'rgba(255,255,255,0.5)', 
              borderRadius: '12px', border: '1px solid var(--glass-border)' 
            }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{job.category}</h4>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(job.created_at).toLocaleDateString()} 
                  {job.servicer_name ? ` • Assigned to ${job.servicer_name}` : ' • Waiting for Professional'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: job.status === 'accepted' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {job.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfileTab = ({ userProfile }) => (
  <div className="glass-panel animate-up" style={{ padding: '2rem', display: 'flex', gap: '3rem' }}>
    <div style={{ width: '250px', textAlign: 'center' }}>
      <div 
        style={{ 
          width: '150px', height: '150px', borderRadius: '50%', marginBottom: '1rem', 
          backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1rem' 
        }}
      >
        {userProfile?.name?.charAt(0) || 'U'}
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{userProfile?.name || 'Customer'}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Customer Account</p>
      
      <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} title="Update your account information">
        Edit Profile
      </button>
    </div>
    
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Account Details</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address</label>
          <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>Not configured</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Phone Number</label>
          <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>Not configured</div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Default Saved Location</label>
          <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>Not configured</div>
        </div>
      </div>
    </div>
  </div>
);
