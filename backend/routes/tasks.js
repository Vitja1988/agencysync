const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();

// Get all tasks
router.get('/', auth, (req, res) => {
  const { client_id, status } = req.query;
  let query = `SELECT tasks.*, clients.name as client_name 
               FROM tasks 
               LEFT JOIN clients ON tasks.client_id = clients.id 
               WHERE tasks.user_id = ?`;
  let params = [req.userId];

  if (client_id) {
    query += ' AND tasks.client_id = ?';
    params.push(client_id);
  }
  if (status) {
    query += ' AND tasks.status = ?';
    params.push(status);
  }
  query += ' ORDER BY tasks.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single task
router.get('/:id', auth, (req, res) => {
  db.get(
    `SELECT tasks.*, clients.name as client_name 
     FROM tasks 
     LEFT JOIN clients ON tasks.client_id = clients.id 
     WHERE tasks.id = ? AND tasks.user_id = ?`,
    [req.params.id, req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Task not found' });
      res.json(row);
    }
  );
});

// Create task
router.post('/', auth, [
  body('title').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, client_id, status, priority, due_date } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO tasks (id, user_id, client_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, client_id, title, description, status || 'todo', priority || 'medium', due_date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, title, client_id, status: status || 'todo', priority: priority || 'medium' });
    }
  );
});

// Update task
router.put('/:id', auth, (req, res) => {
  const { title, description, client_id, status, priority, due_date } = req.body;

  db.run(
    'UPDATE tasks SET title = ?, description = ?, client_id = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
    [title, description, client_id, status, priority, due_date, req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task updated' });
    }
  );
});

// Delete task
router.delete('/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task deleted' });
    }
  );
});

module.exports = router;