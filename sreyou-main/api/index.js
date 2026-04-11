import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
// Replaces SQLite temporarily to prevent Vercel Serverless Functions 
// from crashing on native C++ bindings for the sqlite3 module.
const store = {
  users: [],
  jobs: []
};
let lastUserId = 1;
let lastJobId = 1;

// Register a new user
app.post('/api/auth/register', (req, res) => {
  const { username, password, role, name } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  const existing = store.users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const user = { id: lastUserId++, username, password, role, name: name || username };
  store.users.push(user);
  res.status(201).json({ user: { id: user.id, username, role, name: user.name } });
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = store.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ user: { id: user.id, username, role: user.role, name: user.name } });
});

// Broadcast (create) a job
app.post('/api/jobs', (req, res) => {
  const { customer_id, customer_name, category, description } = req.body;
  
  if (!customer_id || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const job = {
    id: lastJobId++,
    customer_id: String(customer_id),
    customer_name,
    category,
    description: description || '',
    status: 'pending',
    servicer_id: null,
    servicer_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  store.jobs.push(job);
  res.status(201).json({ id: job.id, status: 'pending', message: 'Job broadcasted successfully' });
});

// Get all pending jobs (for servicer dashboard)
app.get('/api/jobs/available', (req, res) => {
  const available = store.jobs
    .filter(j => j.status === 'pending')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(available);
});

// Accept a job
app.post('/api/jobs/:id/accept', (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const { servicer_id, servicer_name } = req.body;
  
  if (!servicer_id || !servicer_name) {
    return res.status(400).json({ error: 'Servicer details required' });
  }

  const job = store.jobs.find(j => j.id === jobId && j.status === 'pending');
  if (!job) {
    return res.status(404).json({ error: 'Job not found or already accepted' });
  }

  job.status = 'accepted';
  job.servicer_id = String(servicer_id);
  job.servicer_name = servicer_name;
  job.updated_at = new Date().toISOString();

  res.json({ message: 'Job accepted successfully' });
});

// Get jobs for a specific user (customer history or servicer active)
app.get('/api/users/:userId/jobs', (req, res) => {
  const userId = String(req.params.userId);
  const role = req.query.role; // 'customer' or 'servicer'
  
  if (!role) return res.status(400).json({ error: 'Role query param required' });

  const jobs = store.jobs
    .filter(j => role === 'customer' ? j.customer_id === userId : (j.servicer_id === userId && j.status === 'accepted'))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
  res.json(jobs);
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Development API Server running on http://localhost:${PORT}`);
  });
}

export default app;
