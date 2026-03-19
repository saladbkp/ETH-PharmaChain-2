const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory
} = require('../models/Category');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/categories
 * List all categories
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = getAllCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/categories
 * Admin adds a new category
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryData = {
      name: name.trim(),
      createdBy: req.user.id
    };

    const category = createCategory(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/categories/:id
 * Admin edits a category
 */
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = updateCategory(req.params.id, { name: name.trim() });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/categories/:id
 * Admin deletes a category
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = deleteCategory(req.params.id);

    if (result) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/categories/:id
 * Get category by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
