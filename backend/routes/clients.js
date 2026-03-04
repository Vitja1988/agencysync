const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();

// Get all clients
router.get('/', auth, (req, res) => {
  db.all(
    'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single client
router.get('/:id', auth, (req, res) => {
  db.get(
    'SELECT * FROM clients WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Client not found' });
      res.json(row);
    }
  );
});

// Create client
router.post('/', auth, [
  body('name').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, company, notes, color } = req.body;
  const id = uuidv4();

  // Choose random color if not provided
  const presetColors = ['violet', 'indigo', 'blue', 'emerald', 'teal', 'rose', 'amber', 'fuchsia'];
  const finalColor = color || presetColors[Math.floor(Math.random() * presetColors.length)];

  db.run(
    'INSERT INTO clients (id, user_id, name, email, phone, company, color, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, name, email, phone, company, finalColor, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, name, email, phone, company, color: finalColor, notes });
    }
  );
});

// Update client
router.put('/:id', auth, (req, res) => {
  const { name, email, phone, company, status, notes, color } = req.body;

  db.run(
    'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, status = ?, notes = ?, color = ? WHERE id = ? AND user_id = ?',
    [name, email, phone, company, status, notes, color, req.params.id, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Client not found' });
      res.json({ message: 'Client updated' });
    }
  );
});

// Delete client
router.delete('/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM clients WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Client not found' });
      res.json({ message: 'Client deleted' });
    }
  );
});

module.exports = router;