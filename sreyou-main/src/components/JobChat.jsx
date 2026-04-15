import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

const JobChat = ({ job, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!job) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${job.id}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [job]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await fetch(`${API_URL}/api/messages/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: text.trim()
        })
      });
      setText('');
      // Optimistic fetch
      const res = await fetch(`${API_URL}/api/messages/${job.id}`);
      setMessages(await res.json());
    } catch (err) {}
  };

  const handleReject = async () => {
    const isPaid = job.payment_status === 'in_escrow';
    const warning = isPaid 
      ? "This job is already paid. Withdrawing will keep the funds in escrow for the next worker, but may affect your professional rating. Continue?"
      : "Are you sure you want to withdraw from this job? It will be made available to other professionals.";
    
    if (!window.confirm(warning)) return;

    try {
      const res = await fetch(`${API_URL}/api/jobs/${job.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to withdraw");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px', right: '20px',
      width: '350px', height: '500px',
      background: 'var(--bg-color)',
      borderRadius: '16px',
      boxShadow: 'var(--glass-shadow)',
      border: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 4000
    }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{currentUser.role === 'customer' ? job.servicer_name : job.customer_name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{job.category} Job Request</span>
            {job.payment_status === 'in_escrow' && (
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>🛡️ Paid</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentUser.role === 'servicer' && (
            <button 
              onClick={handleReject}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.3)', 
                color: 'white', 
                fontSize: '0.75rem', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Withdraw
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
      </div>

      {/* Messages View */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.95 }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Send a message to get started!</div>
        ) : (
          messages.map(m => {
            const isMe = String(m.senderId) === String(currentUser.id);
            return (
              <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                  {m.senderName}
                </div>
                <div style={{
                  background: isMe ? 'var(--primary)' : 'var(--glass-bg)',
                  color: isMe ? 'white' : 'var(--text-primary)',
                  padding: '0.6rem 1rem',
                  borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  boxShadow: 'var(--glass-shadow)',
                  border: isMe ? 'none' : '1px solid var(--glass-border)',
                  fontSize: '0.95rem'
                }}>
                  {m.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
        <input 
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Type a message..."
          style={{ flex: 1, border: 'none', padding: '1rem', outline: 'none', fontSize: '0.95rem', background: 'transparent', color: 'var(--text-primary)' }}
        />
        <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: '0 1rem', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
      </form>
    </div>
  );
};

export default JobChat;
