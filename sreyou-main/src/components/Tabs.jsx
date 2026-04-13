import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

// Separate Tab Views to keep App.jsx clean

export const HistoryTab = ({ currentUser, setActiveChatJob }) => {
  const [history, setHistory] = useState([]);
  const [ratingJob, setRatingJob] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/api/users/${currentUser.id}/jobs?role=customer`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  const submitRating = async (job) => {
    try {
      await fetch(`${API_URL}/api/jobs/${job.id}/complete`, { method: 'POST' });
      await fetch(`${API_URL}/api/reviews`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, servicerId: job.servicer_id, rating: ratingVal, comment: reviewComment })
      });
      setHistory(history.map(h => h.id === job.id ? {...h, status: 'completed'} : h));
      setRatingJob(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (job) => {
    try {
      const isPaid = job.payment_status === 'in_escrow';
      const warning = isPaid 
        ? 'This job is already paid. Cancelling will trigger a full refund to your original payment method. Continue?'
        : 'Cancel this service request?';
      
      if (confirm(warning)) {
        if (isPaid) {
          await fetch(`${API_URL}/api/jobs/${job.id}/refund`, { method: 'POST' });
        } else {
          await fetch(`${API_URL}/api/jobs/${job.id}`, { method: 'DELETE' });
        }
        setHistory(history.filter(h => h.id !== job.id));
      }
    } catch (err) {
      console.error('Failed to cancel job', err);
      alert("Error cancelling job. Please try again.");
    }
  };

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
              padding: '1.25rem', background: 'rgba(255,255,255,0.5)', 
              borderRadius: '12px', border: '1px solid var(--glass-border)',
              flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{job.category}</h4>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {new Date(job.created_at).toLocaleDateString()} 
                  {job.servicer_name ? ` • With ${job.servicer_name}` : ' • Search pending'}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
                <div style={{ 
                  color: job.status === 'accepted' ? 'var(--primary)' : 'var(--text-secondary)', 
                  fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {job.status}
                </div>
                {job.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {job.payment_status === 'in_escrow' && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(30, 109, 94, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        🛡️ ESCROWED
                      </span>
                    )}
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCancel(job)}>
                      Cancel
                    </button>
                  </div>
                )}
                {job.status === 'accepted' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveChatJob(job)}>
                      Message
                    </button>
                    <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setRatingJob(job); setRatingVal(5); setReviewComment(''); }}>
                      Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Rating Modal */}
      {ratingJob && (
         <div style={{
           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
           backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)',
           display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
         }}>
           <div className="glass-panel" style={{ width: '400px', background: 'rgba(255,255,255,0.95)' }}>
             <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Rate {ratingJob.servicer_name}</h3>
             
             <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '2rem', cursor: 'pointer', justifyContent: 'center' }}>
               {[1,2,3,4,5].map(star => (
                 <span key={star} onClick={() => setRatingVal(star)} style={{ color: star <= ratingVal ? '#f59e0b' : '#ddd' }}>
                   ★
                 </span>
               ))}
             </div>

             <textarea 
               placeholder="Leave a short comment (optional)..."
               value={reviewComment}
               onChange={e => setReviewComment(e.target.value)}
               style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1.5rem', resize: 'none' }}
             />

             <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRatingJob(null)}>Cancel</button>
               <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => submitRating(ratingJob)}>Submit Review</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

export const ProfileTab = ({ userProfile, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || ''
  });

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.user && onUpdateUser) {
        onUpdateUser(data.user);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  return (
    <div className="glass-panel animate-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem' }}>
      <div style={{ flex: '1 1 200px', textAlign: 'center', maxWidth: '300px', margin: '0 auto' }}>
        <div 
          style={{ 
            width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1rem', 
            backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1rem',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          {userProfile?.name?.charAt(0) || 'U'}
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{userProfile?.name || 'Customer'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Platinum Member</p>
        
        <button className="btn" style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem' }} onClick={() => setIsEditing(!isEditing)} title="Update your account information">
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      <div style={{ flex: '1 1 300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-secondary)' }}>Security & Identity</h3>
          {isEditing && (
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={handleSave}>Save</button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address</label>
            {isEditing ? (
              <input type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@email.com" />
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.95rem' }}>{userProfile?.email || 'Not shared'}</div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Phone Number</label>
            {isEditing ? (
              <input type="tel" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 000-0000" />
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.95rem' }}>{userProfile?.phone || 'Not shared'}</div>
            )}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Primary Service Location</label>
            {isEditing ? (
              <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white' }} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="123 Main St, City" />
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.95rem' }}>{userProfile?.location || 'Detecting...'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
