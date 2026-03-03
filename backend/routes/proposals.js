const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();

// Get all proposals
router.get('/', auth, (req, res) => {
  db.all(
    `SELECT proposals.*, clients.name as client_name 
     FROM proposals 
     JOIN clients ON proposals.client_id = clients.id 
     WHERE proposals.user_id = ? 
     ORDER BY proposals.created_at DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single proposal
router.get('/:id', auth, (req, res) => {
  db.get(
    `SELECT proposals.*, clients.name as client_name 
     FROM proposals 
     JOIN clients ON proposals.client_id = clients.id 
     WHERE proposals.id = ? AND proposals.user_id = ?`,
    [req.params.id, req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Proposal not found' });
      res.json(row);
    }
  );
});

// Create proposal
router.post('/', auth, [
  body('title').notEmpty(),
  body('client_id').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, client_id, description, amount, content } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO proposals (id, user_id, client_id, title, description, amount, content) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, client_id, title, description, amount, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, title, client_id, description, amount, status: 'draft' });
    }
  );
});

// Update proposal
router.put('/:id', auth, (req, res) => {
  const { title, description, amount, status, content } = req.body;

  db.run(
    'UPDATE proposals SET title = ?, description = ?, amount = ?, status = ?, content = ? WHERE id = ? AND user_id = ?',
    [title, description, amount, status, content, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Proposal not found' });
      res.json({ message: 'Proposal updated' });
    }
  );
});

// Delete proposal
router.delete('/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM proposals WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Proposal not found' });
      res.json({ message: 'Proposal deleted' });
    }
  );
});

module.exports = router;