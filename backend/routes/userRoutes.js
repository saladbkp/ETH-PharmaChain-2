const express = require('express');
const router = express.Router();
const { loadUsers } = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = loadUsers();

    // Remove passwords from response
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role
    }));

    res.json({ users: safeUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/users/retailers
 * Get all retailer users (for manufacturer transfer)
 */
router.get('/retailers', authenticateToken, requireRole('manufacturer', 'admin'), async (req, res) => {
  try {
    const users = loadUsers();

    // Filter only retailers and remove passwords
    const retailers = users
      .filter(user => user.role === 'retailer')
      .map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
      }));

    res.json({ retailers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const safeUser = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
