const express = require('express');
const router = express.Router();
const {
  createBatch,
  getBatchById,
  getBatchesByStatus,
  getBatchesByManufacturer,
  updateBatchStatus,
  getAllBatches
} = require('../models/Batch');
const { getMedicineById } = require('../models/Medicine');
const { getCategoryById } = require('../models/Category');
const { createApprovalRecord } = require('../models/ApprovalHistory');
const { setInventory } = require('../models/Inventory');
const { createTransaction } = require('../models/Transaction');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * POST /api/batches/create
 * Manufacturer creates a new batch
 */
router.post('/create', authenticateToken, requireRole('manufacturer'), async (req, res) => {
  try {
    const { medicineId, batchId, quantity, manufactureDate, expiryDate } = req.body;

    // Validation
    if (!medicineId || !batchId || !quantity || !manufactureDate || !expiryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate batch ID format
    const batchPattern = /^[A-Za-z0-9-]{5,20}$/;
    if (!batchPattern.test(batchId)) {
      return res.status(400).json({ message: 'Batch ID must be 5-20 alphanumeric characters (dash allowed)' });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Validate dates
    const manufacture = new Date(manufactureDate);
    const expiry = new Date(expiryDate);
    const now = new Date();

    if (manufacture > now) {
      return res.status(400).json({ message: 'Manufacture date cannot be in the future' });
    }

    if (expiry <= manufacture) {
      return res.status(400).json({ message: 'Expiry date must be after manufacture date' });
    }

    // Check if medicine exists and is approved
    const medicine = getMedicineById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.status !== 'approved') {
      return res.status(400).json({ message: 'Can only create batches for approved medicines' });
    }

    const batchData = {
      medicineId,
      malNumber: medicine.malNumber,
      batchId,
      quantity,
      manufactureDate: manufacture.toISOString(),
      expiryDate: expiry.toISOString(),
      manufacturerId: req.user.id,
      status: 'pending'
    };

    const batch = createBatch(batchData);

    res.status(201).json({
      message: 'Batch submitted for approval',
      batch: {
        id: batch.id,
        batchId: batch.batchId,
        status: batch.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/batches/pending
 * Admin gets all pending batches
 */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pendingBatches = getBatchesByStatus('pending');

    // Enrich with medicine information and category name
    const enriched = pendingBatches.map(batch => {
      const medicine = getMedicineById(batch.medicineId);
      const category = medicine ? getCategoryById(medicine.category) : null;
      return {
        ...batch,
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        categoryName: category ? category.name : 'Unknown'
      };
    });

    res.json({ batches: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/batches/:id/approve
 * Admin approves a batch
 */
router.post('/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const batch = getBatchById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.status !== 'pending') {
      return res.status(400).json({ message: 'Batch is not pending' });
    }

    // Update batch status
    const approvedBatch = updateBatchStatus(batch.id, 'approved');

    // Add to manufacturer inventory
    setInventory(batch.manufacturerId, batch.batchId, batch.quantity);

    // Record approval history
    createApprovalRecord({
      entityType: 'batch',
      entityId: batch.id,
      action: 'approved',
      approvedBy: req.user.id,
      notes: `Batch ${batch.batchId} approved`
    });

    // Create transaction record
    createTransaction({
      batchId: batch.batchId,
      toUserId: batch.manufacturerId,
      quantity: batch.quantity,
      transactionType: 'stock_add'
    });

    res.json({
      message: 'Batch approved successfully',
      batch: approvedBatch
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/batches/:id/reject
 * Admin rejects a batch
 */
router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const batch = getBatchById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.status !== 'pending') {
      return res.status(400).json({ message: 'Batch is not pending' });
    }

    // Update batch status
    const rejectedBatch = updateBatchStatus(batch.id, 'rejected');

    // Record rejection history
    createApprovalRecord({
      entityType: 'batch',
      entityId: batch.id,
      action: 'rejected',
      approvedBy: req.user.id,
      notes: notes || 'No notes provided'
    });

    res.json({
      message: 'Batch rejected',
      batch: rejectedBatch
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/batches/my-batches
 * Manufacturer gets their batches
 */
router.get('/my-batches', authenticateToken, requireRole('manufacturer'), async (req, res) => {
  try {
    const batches = getBatchesByManufacturer(req.user.id);

    // Enrich with medicine information and category name
    const enriched = batches.map(batch => {
      const medicine = getMedicineById(batch.medicineId);
      const category = medicine ? getCategoryById(medicine.category) : null;
      return {
        ...batch,
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        categoryName: category ? category.name : 'Unknown'
      };
    });

    res.json({ batches: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/batches/approved
 * Get all approved batches (admin only - for QR generation)
 */
router.get('/approved', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const batches = getAllBatches();
    const approvedBatches = batches.filter(b => b.status === 'approved');

    // Enrich with medicine information, category name, and inventory info
    const enriched = approvedBatches.map(batch => {
      const medicine = getMedicineById(batch.medicineId);
      const category = medicine ? getCategoryById(medicine.category) : null;

      return {
        ...batch,
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        categoryName: category ? category.name : 'Unknown',
        malNumber: medicine ? medicine.malNumber : 'N/A'
      };
    });

    res.json({ batches: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/batches/history
 * Get batch approval/reject history (admin only)
 * IMPORTANT: This route must be defined BEFORE /:id to avoid "history" being treated as an ID
 */
router.get('/history', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { getApprovalHistoryByType } = require('../models/ApprovalHistory');
    const history = getApprovalHistoryByType('batch');
    const batches = getAllBatches();

    const enriched = history.map(record => {
      const batch = batches.find(b => b.id === record.entityId);
      const medicine = batch ? getMedicineById(batch.medicineId) : null;
      return {
        ...record,
        batchId: batch ? batch.batchId : 'Unknown',
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        quantity: batch ? batch.quantity : 'N/A',
        expiryDate: batch ? batch.expiryDate : 'N/A'
      };
    });

    // Sort by date (newest first)
    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ history: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/batches/:id
 * Get batch details
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const batch = getBatchById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const medicine = getMedicineById(batch.medicineId);
    const category = medicine ? getCategoryById(medicine.category) : null;

    res.json({
      batch: {
        ...batch,
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        categoryName: category ? category.name : 'Unknown'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
