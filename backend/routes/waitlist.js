const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

const router = express.Router();

// Add email to waitlist
router.post('/', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const id = uuidv4();

  db.run(
    'INSERT INTO waitlist (id, email) VALUES (?, ?)',
    [id, email],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        console.error('Waitlist error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json({ message: 'Successfully added to waitlist', id });
    }
  );
});

// Get waitlist count (admin only - could add auth middleware later)
router.get('/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM waitlist', (err, row) => {
    if (err) {
      console.error('Error counting waitlist:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ count: row.count });
  });
});

module.exports = router;
