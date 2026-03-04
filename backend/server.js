const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = require('./database/db');

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/clients', require('./routes/clients'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/time', require('./routes/time'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 AgencySync API running on port ${PORT}`);
});

module.exports = app;