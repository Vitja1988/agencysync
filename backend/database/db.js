const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'agencysync.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    date_format TEXT DEFAULT 'dd.MM.yyyy',
    time_format TEXT DEFAULT '24h',
    currency TEXT DEFAULT 'EUR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clients table
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    color TEXT DEFAULT 'violet',
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Proposals table
  db.run(`CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount REAL,
    status TEXT DEFAULT 'draft',
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // Tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // Time entries table
  db.run(`CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT,
    task_id TEXT,
    description TEXT,
    hours REAL NOT NULL,
    date DATE NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  )`);

  // Waitlist table
  db.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Integrations table
  db.run(`CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, provider)
  )`);

  // Subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    payment_provider TEXT,
    customer_id TEXT,
    subscription_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Migration for color column if it doesn't exist
  db.run("ALTER TABLE clients ADD COLUMN color TEXT DEFAULT 'violet'", (err) => {
    // Ignore error if column already exists
  });

  // Migrations for time_entries
  db.run("ALTER TABLE time_entries ADD COLUMN start_time DATETIME", (err) => { });
  db.run("ALTER TABLE time_entries ADD COLUMN end_time DATETIME", (err) => { });

  // Migrations for user preferences
  db.run("ALTER TABLE users ADD COLUMN date_format TEXT DEFAULT 'dd.MM.yyyy'", (err) => { });
  db.run("ALTER TABLE users ADD COLUMN time_format TEXT DEFAULT '24h'", (err) => { });
  db.run("ALTER TABLE users ADD COLUMN currency TEXT DEFAULT 'EUR'", (err) => { });

});

module.exports = db;