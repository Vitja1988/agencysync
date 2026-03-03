const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();

// Get all time entries
router.get('/', auth, (req, res) => {
  const { client_id, task_id } = req.query;
  let query = `SELECT time_entries.*, clients.name as client_name, tasks.title as task_title
               FROM time_entries 
               LEFT JOIN clients ON time_entries.client_id = clients.id 
               LEFT JOIN tasks ON time_entries.task_id = tasks.id
               WHERE time_entries.user_id = ?`;
  let params = [req.userId];

  if (client_id) {
    query += ' AND time_entries.client_id = ?';
    params.push(client_id);
  }
  if (task_id) {
    query += ' AND time_entries.task_id = ?';
    params.push(task_id);
  }
  query += ' ORDER BY time_entries.date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get time summary by client
router.get('/summary', auth, (req, res) => {
  db.all(
    `SELECT clients.name, SUM(time_entries.hours) as total_hours
     FROM time_entries 
     JOIN clients ON time_entries.client_id = clients.id 
     WHERE time_entries.user_id = ?
     GROUP BY time_entries.client_id`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create time entry
router.post('/', auth, [
  body('hours').isNumeric(),
  body('date').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { description, client_id, task_id, hours, date } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO time_entries (id, user_id, client_id, task_id, description, hours, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, client_id, task_id, description, hours, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, description, client_id, hours, date });
    }
  );
});

// Update time entry
router.put('/:id', auth, (req, res) => {
  const { description, client_id, task_id, hours, date } = req.body;

  db.run(
    'UPDATE time_entries SET description = ?, client_id = ?, task_id = ?, hours = ?, date = ? WHERE id = ? AND user_id = ?',
    [description, client_id, task_id, hours, date, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Time entry not found' });
      res.json({ message: 'Time entry updated' });
    }
  );
});

// Delete time entry
router.delete('/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM time_entries WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Time entry not found' });
      res.json({ message: 'Time entry deleted' });
    }
  );
});

module.exports = router;