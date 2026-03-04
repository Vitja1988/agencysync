const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'agencysync-secret-key-change-in-production';

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, company_name } = req.body;

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (user) return res.status(400).json({ error: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      db.run(
        'INSERT INTO users (id, email, password, name, company_name) VALUES (?, ?, ?, ?, ?)',
        [userId, email, hashedPassword, name, company_name],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
          res.status(201).json({
            token,
            user: { id: userId, email, name, company_name }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_name: user.company_name
      }
    });
  });
});

// Verify token and return user
router.get('/verify', auth, (req, res) => {
  const query = `
    SELECT u.id, u.email, u.name, u.company_name, 
           s.plan_type, s.status as subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id
    WHERE u.id = ?
    ORDER BY s.created_at DESC
    LIMIT 1
  `;

  db.get(query, [req.userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Format response to include nested subscription object
    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      company_name: user.company_name,
      subscription: user.plan_type ? {
        plan_type: user.plan_type,
        status: user.subscription_status
      } : null
    };

    res.json({ user: formattedUser });
  });
});
// Update User Profile
router.put('/me', auth, [
  body('name').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, company_name, date_format, time_format, currency } = req.body;

  db.run(
    'UPDATE users SET name = ?, company_name = ?, date_format = ?, time_format = ?, currency = ? WHERE id = ?',
    [name, company_name, date_format, time_format, currency, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'Profile updated', user: { name, company_name, date_format, time_format, currency } });
    }
  );
});

module.exports = { router, auth };