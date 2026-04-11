import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Register a new user
app.post('/api/auth/register', (req, res) => {
  const { username, password, role, name } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  const query = `INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, password, role, name || username], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ user: { id: this.lastID, username, role, name: name || username } });
  });
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(`SELECT id, username, role, name FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ user: row });
  });
});

// Broadcast (create) a job
app.post('/api/jobs', (req, res) => {
  const { customer_id, customer_name, category, description } = req.body;
  
  if (!customer_id || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO jobs (customer_id, customer_name, category, description, status) 
                 VALUES (?, ?, ?, ?, 'pending')`;
  
  db.run(query, [customer_id, customer_name, category, description || ''], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: this.lastID, 
      status: 'pending',
      message: 'Job broadcasted successfully' 
    });
  });
});

// Get all pending jobs (for servicer dashboard)
app.get('/api/jobs/available', (req, res) => {
  db.all(`SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Accept a job
app.post('/api/jobs/:id/accept', (req, res) => {
  const jobId = req.params.id;
  const { servicer_id, servicer_name } = req.body;
  
  if (!servicer_id || !servicer_name) {
    return res.status(400).json({ error: 'Servicer details required' });
  }

  db.run(`UPDATE jobs SET status = 'accepted', servicer_id = ?, servicer_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
    [servicer_id, servicer_name, jobId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Job not found or already accepted' });
      res.json({ message: 'Job accepted successfully' });
    }
  );
});

// Get jobs for a specific user (customer history or servicer active)
app.get('/api/users/:userId/jobs', (req, res) => {
  const userId = req.params.userId;
  const role = req.query.role; // 'customer' or 'servicer'
  
  if (!role) return res.status(400).json({ error: 'Role query param required' });

  const query = role === 'customer' 
    ? `SELECT * FROM jobs WHERE customer_id = ? ORDER BY created_at DESC`
    : `SELECT * FROM jobs WHERE servicer_id = ? AND status = 'accepted' ORDER BY created_at DESC`;
    
  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Development API Server running on http://localhost:${PORT}`);
  });
}

export default app;
