const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactionsByType,
  getAllTransactions
} = require('../models/Transaction');
const { createApprovalRecord, getApprovalHistoryByType } = require('../models/ApprovalHistory');
const { updateInventory, getInventoryByUser } = require('../models/Inventory');
const { getBatchById, loadBatches } = require('../models/Batch');
const { getMedicineById } = require('../models/Medicine');
const { loadUsers } = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * POST /api/stock/request-add
 * Manufacturer requests stock addition
 */
router.post('/request-add', authenticateToken, requireRole('manufacturer'), async (req, res) => {
  try {
    const { batchId, quantity, reason } = req.body;

    // Validation
    if (!batchId || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if batch exists and belongs to manufacturer
    const batch = getBatchById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.manufacturerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this batch' });
    }

    // Create stock change request transaction
    const transaction = createTransaction({
      batchId,
      toUserId: req.user.id,
      quantity,
      transactionType: 'stock_add',
      notes: reason || 'Stock addition request'
    });

    // Create approval record as pending
    const approval = createApprovalRecord({
      entityType: 'stock_change',
      entityId: transaction.id,
      action: 'approved', // Will be updated when admin decides
      approvedBy: null,
      notes: reason || 'Stock addition request pending approval'
    });

    res.status(201).json({
      message: 'Stock addition request submitted',
      requestId: transaction.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/stock/request-reduce
 * Manufacturer requests stock reduction
 */
router.post('/request-reduce', authenticateToken, requireRole('manufacturer'), async (req, res) => {
  try {
    const { batchId, quantity, reason } = req.body;

    // Validation
    if (!batchId || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if user has enough inventory
    const inventory = getInventoryByUser(req.user.id);
    const item = inventory.find(i => i.batchId === batchId);

    if (!item || item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient inventory' });
    }

    // Check if batch exists and belongs to manufacturer
    const batch = getBatchById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.manufacturerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this batch' });
    }

    // Create stock change request transaction
    const transaction = createTransaction({
      batchId,
      fromUserId: req.user.id,
      quantity,
      transactionType: 'stock_reduce',
      notes: reason || 'Stock reduction request'
    });

    // Create approval record as pending
    const approval = createApprovalRecord({
      entityType: 'stock_change',
      entityId: transaction.id,
      action: 'approved', // Will be updated when admin decides
      approvedBy: null,
      notes: reason || 'Stock reduction request pending approval'
    });

    res.status(201).json({
      message: 'Stock reduction request submitted',
      requestId: transaction.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/stock/pending
 * Admin gets all pending stock change requests
 */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Get all stock_change transactions
    const transactions = getTransactionsByType('stock_add')
      .concat(getTransactionsByType('stock_reduce'));

    const batches = loadBatches();
    const users = loadUsers();

    // Enrich with batch, medicine, and user details
    const enriched = transactions.map(tx => {
      const batch = batches.find(b => b.batchId === tx.batchId);
      let medicineName = 'Unknown';
      let malNumber = 'Unknown';

      if (batch) {
        const medicine = getMedicineById(batch.medicineId);
        if (medicine) {
          medicineName = medicine.medicineName;
          malNumber = medicine.malNumber;
        }
      }

      // Get user names (convert both to strings for comparison)
      const fromUser = tx.fromUserId ? users.find(u => String(u.id) === String(tx.fromUserId)) : null;
      const toUser = tx.toUserId ? users.find(u => String(u.id) === String(tx.toUserId)) : null;

      return {
        ...tx,
        medicineName,
        malNumber,
        fromUsername: fromUser ? fromUser.username : 'Unknown',
        toUsername: toUser ? toUser.username : 'Unknown',
        status: 'pending'
      };
    });

    res.json({ requests: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/stock/:id/approve
 * Admin approves stock change
 */
router.post('/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { createTransaction: getTx, getAllTransactions } = require('../models/Transaction');
    const transactions = getAllTransactions();
    const transaction = transactions.find(t => t.id === req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Stock change request not found' });
    }

    // Process the stock change
    if (transaction.transactionType === 'stock_add') {
      updateInventory(transaction.toUserId, transaction.batchId, transaction.quantity);
    } else if (transaction.transactionType === 'stock_reduce') {
      updateInventory(transaction.fromUserId, transaction.batchId, -transaction.quantity);
    }

    // Update approval record
    const { createApprovalRecord } = require('../models/ApprovalHistory');
    createApprovalRecord({
      entityType: 'stock_change',
      entityId: transaction.id,
      action: 'approved',
      approvedBy: req.user.id,
      notes: `Stock ${transaction.transactionType} approved`
    });

    res.json({
      message: 'Stock change approved and processed',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/stock/:id/reject
 * Admin rejects stock change
 */
router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const { getAllTransactions } = require('../models/Transaction');
    const transactions = getAllTransactions();
    const transaction = transactions.find(t => t.id === req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Stock change request not found' });
    }

    // Record rejection
    const { createApprovalRecord } = require('../models/ApprovalHistory');
    createApprovalRecord({
      entityType: 'stock_change',
      entityId: transaction.id,
      action: 'rejected',
      approvedBy: req.user.id,
      notes: notes || 'Stock change rejected'
    });

    res.json({
      message: 'Stock change rejected',
      transactionId: transaction.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
