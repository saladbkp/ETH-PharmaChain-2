const express = require('express');
const router = express.Router();
const {
  getInventoryByUser,
  updateInventory,
  checkInventoryAvailable
} = require('../models/Inventory');
const {
  createTransaction,
  getTransactionsByUser,
  getAllTransactions
} = require('../models/Transaction');
const { getBatchById, loadBatches } = require('../models/Batch');
const { getMedicineById } = require('../models/Medicine');
const { getCategoryById } = require('../models/Category');
const { loadUsers } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/inventory/my-inventory
 * Get user's current inventory
 */
router.get('/my-inventory', authenticateToken, async (req, res) => {
  try {
    const inventory = getInventoryByUser(req.user.id);
    const batches = loadBatches();

    // Enrich inventory with batch and medicine details
    const enriched = inventory.map(item => {
      const batch = batches.find(b => b.batchId === item.batchId);
      let medicineName = 'Unknown';
      let categoryName = 'Unknown';
      let malNumber = 'Unknown';
      let expiryDate = null;

      if (batch) {
        const medicine = getMedicineById(batch.medicineId);
        if (medicine) {
          medicineName = medicine.medicineName;
          const category = getCategoryById(medicine.category);
          categoryName = category ? category.name : 'Unknown';
          malNumber = medicine.malNumber;
        }
        expiryDate = batch.expiryDate;
      }

      return {
        ...item,
        medicineName,
        categoryName,
        malNumber,
        expiryDate
      };
    });

    res.json({ inventory: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/inventory/transfer
 * Transfer inventory to another user (immediate transfer)
 */
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { batchId, quantity, receiverId } = req.body;

    // Validation
    if (!batchId || !quantity || !receiverId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Check if sender has enough inventory
    if (!checkInventoryAvailable(req.user.id, batchId, quantity)) {
      return res.status(400).json({ message: 'Insufficient inventory' });
    }

    // Perform the transfer - update inventory immediately
    updateInventory(req.user.id, batchId, -quantity);
    updateInventory(receiverId, batchId, quantity);

    // Create transaction record
    const transaction = createTransaction({
      batchId,
      fromUserId: req.user.id,
      toUserId: receiverId,
      quantity,
      transactionType: 'transfer',
      notes: 'Transfer completed'
    });

    res.status(201).json({
      message: 'Transfer successful',
      transaction: {
        id: transaction.id,
        batchId,
        quantity,
        from: req.user.id,
        to: receiverId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/inventory/transactions
 * Get transaction history
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    // For admin, get all transactions. For others, get only their transactions
    const { getAllTransactions } = require('../models/Transaction');
    const transactions = req.user.role === 'admin'
      ? getAllTransactions()
      : getTransactionsByUser(req.user.id);

    const batches = loadBatches();
    const users = loadUsers();

    // Enrich transactions with batch, medicine, and user details
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

      // Get user names for from and to (convert both to strings for comparison)
      const fromUser = tx.fromUserId ? users.find(u => String(u.id) === String(tx.fromUserId)) : null;
      const toUser = tx.toUserId ? users.find(u => String(u.id) === String(tx.toUserId)) : null;

      return {
        ...tx,
        medicineName,
        malNumber,
        fromUsername: fromUser ? fromUser.username : null,
        toUsername: toUser ? toUser.username : null
      };
    });

    res.json({ transactions: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/inventory/check/:batchId
 * Check available quantity for a batch
 */
router.get('/check/:batchId', authenticateToken, async (req, res) => {
  try {
    const inventory = getInventoryByUser(req.user.id);
    const item = inventory.find(i => i.batchId === req.params.batchId);

    res.json({
      batchId: req.params.batchId,
      available: item ? item.quantity : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
