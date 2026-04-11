import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://kkeyyjmupssazgterrut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZXl5am11cHNzYXpndGVycnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTg2NTEsImV4cCI6MjA5MTQ5NDY1MX0.N5MKRGSwHe_3qLoQJ0AQ56K7Rbvrk_iAsOZY9Cd4R6I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sync user profile from Supabase Auth
// This ensures that when a user logs in/signs up, we have their role/name in our 'users' table
app.post('/api/auth/sync', async (req, res) => {
  const { id, username, name, role } = req.body;
  if (!id || !role) return res.status(400).json({ error: 'Missing sync data' });

  try {
    // Check if profile exists
    const { data: profile } = await supabase.from('users').select('*').eq('id', id).single();
    
    if (profile) {
      return res.json({ user: profile });
    }

    // Create new profile linked to Auth ID
    const { data: newProfile, error } = await supabase.from('users').insert([{ 
      id, 
      username, 
      role, 
      name: name || username 
    }]).select().single();

    if (error) throw error;
    res.status(201).json({ user: newProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to get profile by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Broadcast (create) a job
app.post('/api/jobs', async (req, res) => {
  const { customer_id, customer_name, category, description, lat, lng } = req.body;
  if (!customer_id || !category) return res.status(400).json({ error: 'Missing required fields' });

  const distance_km = parseFloat((Math.random() * 11.5 + 0.5).toFixed(1));

  try {
    const { data, error } = await supabase.from('jobs').insert([{
      customer_id: String(customer_id),
      customer_name,
      category,
      description: description || '',
      status: 'pending',
      distance_km,
      lat: lat || null,
      lng: lng || null
    }]).select().single();
    
    if (error) throw error;
    res.status(201).json({ id: data.id, status: 'pending', message: 'Job broadcasted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pending jobs
app.get('/api/jobs/available', async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobs').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a job
app.post('/api/jobs/:id/accept', async (req, res) => {
  const jobId = req.params.id;
  const { servicer_id, servicer_name } = req.body;
  
  try {
    const { data, error } = await supabase.from('jobs')
      .update({ status: 'accepted', servicer_id: String(servicer_id), servicer_name, updated_at: new Date().toISOString() })
      .eq('id', jobId)
      .eq('status', 'pending')
      .select().single();

    if (!data || error) return res.status(404).json({ error: 'Job not found or already taken' });
    res.json({ message: 'Job accepted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get jobs for a user
app.get('/api/users/:userId/jobs', async (req, res) => {
  const userId = String(req.params.userId);
  const role = req.query.role;
  
  try {
    let query = supabase.from('jobs').select('*');
    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      query = query.eq('servicer_id', userId).eq('status', 'accepted');
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { email, phone, location } = req.body;
  
  try {
    const { data, error } = await supabase.from('users')
      .update({ email, phone, location })
      .eq('id', userId)
      .select().single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a job
app.delete('/api/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('status', 'pending');
    if (error) throw error;
    res.json({ message: 'Job cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a job
app.post('/api/jobs/:id/complete', async (req, res) => {
  const jobId = req.params.id;
  try {
    const { error } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId);
    if (error) throw error;
    // Clean up messages for completed jobs
    await supabase.from('messages').delete().eq('job_id', jobId);
    res.json({ message: 'Job completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a review
app.post('/api/reviews', async (req, res) => {
  const { jobId, servicerId, rating, comment } = req.body;
  try {
    const { data, error } = await supabase.from('reviews').insert([{
      job_id: jobId,
      servicer_id: String(servicerId),
      rating: parseInt(rating, 10),
      comment
    }]).select('id, jobId:job_id, servicerId:servicer_id, rating, comment, created_at').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a servicer
app.get('/api/users/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews')
      .select('id, jobId:job_id, servicerId:servicer_id, rating, comment, created_at')
      .eq('servicer_id', String(req.params.id));
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message
app.post('/api/messages/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  const { senderId, senderName, text } = req.body;
  try {
    const { data, error } = await supabase.from('messages').insert([{
      job_id: jobId,
      sender_id: String(senderId),
      sender_name: senderName,
      text
    }]).select('id, jobId:job_id, senderId:sender_id, senderName:sender_name, text, created_at').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a job
app.get('/api/messages/:jobId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('messages')
      .select('id, jobId:job_id, senderId:sender_id, senderName:sender_name, text, created_at')
      .eq('job_id', req.params.jobId);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count total available professionals (for Privacy-Safe Radar)
app.get('/api/users/count-servicers', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'servicer');
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Development API Server running on http://localhost:${PORT}`);
  });
}

export default app;
