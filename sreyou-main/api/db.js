import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, the file system is read-only except for /tmp.
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';
let dbPath = process.env.DB_PATH || path.resolve(__dirname, 'store.db');

if (isServerless) {
  const tmpPath = path.join(os.tmpdir(), 'store.db');
  if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpPath);
    } catch (e) {
      console.error('Failed to copy DB to /tmp', e);
    }
  }
  dbPath = tmpPath;
}

const db = new (sqlite3.verbose().Database)(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    
    // Initialize Tables
    db.serialize(() => {
      // Add error handler callback to prevent unhandled exceptions which crash Vercel
      const errHandler = (e) => {
        if (e) console.error('Table creation error:', e.message);
      };

      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, errHandler);

      // Jobs table
      db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending', 
        servicer_id TEXT,
        servicer_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, errHandler);
    });
  }
});

db.on('error', (err) => {
  console.error('SQLite Database Error:', err);
});

export default db;
