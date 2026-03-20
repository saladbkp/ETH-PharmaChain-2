const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicineById,
  getMedicinesByStatus,
  getMedicinesBySubmitter,
  updateMedicineStatus,
  getApprovedMedicines,
  loadMedicines
} = require('../models/Medicine');
const { createApprovalRecord, getApprovalHistoryByType } = require('../models/ApprovalHistory');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { generateMALNumber, getNextSequence } = require('../utils/malGenerator');
const { getAllCategories, getCategoryById } = require('../models/Category');

/**
 * POST /api/medicines/submit
 * Manufacturer submits a new medicine for approval
 */
router.post('/submit', authenticateToken, requireRole('manufacturer', 'admin'), async (req, res) => {
  try {
    const upload = req.app.get('upload');
    const uploadSingle = upload.single('approvalDocument');

    uploadSingle(req, res, async (err) => {
      if (err) {
        // If it's not a multipart form error, return error
        if (!err.message.includes('Unexpected field') && !err.message.includes('Multipart')) {
          return res.status(400).json({ message: err.message });
        }
        // Continue without file if it's a multipart error
      }

      const { medicineName, category, companyName, registrationNumber, contactEmail } = req.body;

      // Validation
      if (!medicineName || !category || !companyName || !contactEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (registrationNumber) {
        const regPattern = /^[A-Za-z0-9-]{5,20}$/;
        if (!regPattern.test(registrationNumber)) {
          return res.status(400).json({ message: 'Registration number must be 5-20 alphanumeric characters (dash allowed)' });
        }
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(contactEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const medicineData = {
        medicineName,
        category,
        companyName,
        registrationNumber: registrationNumber || null,
        contactEmail,
        approvalDocument: req.file ? req.file.filename : null, // File is optional now
        submittedBy: req.user.id,
        status: 'pending'
      };

      const medicine = createMedicine(medicineData);
      res.status(201).json({
        message: 'Medicine submitted for approval',
        medicine: {
          id: medicine.id,
          medicineName: medicine.medicineName,
          status: medicine.status
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/medicines/pending
 * Admin gets all pending medicine submissions
 */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pendingMedicines = getMedicinesByStatus('pending');

    // Enrich with category names and submitter info
    const enriched = pendingMedicines.map(med => {
      const category = getCategoryById(med.category);
      return {
        ...med,
        categoryName: category ? category.name : med.category
      };
    });

    res.json({ medicines: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/medicines/:id/approve
 * Admin approves a medicine submission (generates MAL number)
 */
router.post('/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const medicine = getMedicineById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.status !== 'pending') {
      return res.status(400).json({ message: 'Medicine is not pending' });
    }

    // File requirement removed for testing - document is optional
    // if (!medicine.approvalDocument) {
    //   return res.status(400).json({ message: 'Cannot approve without approval document' });
    // }

    // Generate MAL number
    const currentYear = new Date().getFullYear();
    const allMedicines = loadMedicines();
    const nextSequence = getNextSequence(allMedicines, currentYear);
    const malNumber = generateMALNumber(currentYear, nextSequence);

    // Update medicine status
    const approvedMedicine = updateMedicineStatus(medicine.id, 'approved', malNumber);

    // Record approval history
    createApprovalRecord({
      entityType: 'medicine',
      entityId: medicine.id,
      action: 'approved',
      approvedBy: req.user.id,
      notes: `MAL number generated: ${malNumber}`
    });

    res.json({
      message: 'Medicine approved successfully',
      medicine: approvedMedicine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/medicines/:id/reject
 * Admin rejects a medicine submission
 */
router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const medicine = getMedicineById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.status !== 'pending') {
      return res.status(400).json({ message: 'Medicine is not pending' });
    }

    // Update medicine status
    const rejectedMedicine = updateMedicineStatus(medicine.id, 'rejected');

    // Record rejection history
    createApprovalRecord({
      entityType: 'medicine',
      entityId: medicine.id,
      action: 'rejected',
      approvedBy: req.user.id,
      notes: notes || 'No notes provided'
    });

    res.json({
      message: 'Medicine rejected',
      medicine: rejectedMedicine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/medicines/approved
 * Get all approved medicines (for batch creation)
 */
router.get('/approved', authenticateToken, async (req, res) => {
  try {
    const approvedMedicines = getApprovedMedicines();
    const categories = getAllCategories();

    const enriched = approvedMedicines.map(med => {
      const category = categories.find(c => c.id === med.category);
      return {
        id: med.id,
        medicineName: med.medicineName,
        malNumber: med.malNumber,
        categoryName: category ? category.name : med.category,
        companyId: med.companyName
      };
    });

    res.json({ medicines: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/medicines/history
 * Get approval history
 */
router.get('/history', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const history = getApprovalHistoryByType('medicine');
    const medicines = loadMedicines();

    const enriched = history.map(record => {
      const medicine = medicines.find(m => m.id === record.entityId);
      return {
        ...record,
        medicineName: medicine ? medicine.medicineName : 'Unknown',
        companyName: medicine ? medicine.companyName : 'Unknown',
        malNumber: medicine ? medicine.malNumber : null
      };
    });

    res.json({ history: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/medicines/my-submissions
 * Manufacturer gets their own submissions
 */
router.get('/my-submissions', authenticateToken, requireRole('manufacturer'), async (req, res) => {
  try {
    const submissions = getMedicinesBySubmitter(req.user.id);

    // Get approval history to include rejection notes
    const approvalHistory = getApprovalHistoryByType('medicine');

    // Enrich with category names and rejection notes
    const enriched = submissions.map(med => {
      const category = getCategoryById(med.category);

      // Find rejection notes from approval history
      const rejectionRecord = approvalHistory.find(
        record => record.entityId === med.id && record.action === 'rejected'
      );

      return {
        ...med,
        categoryName: category ? category.name : med.category,
        rejectionNotes: rejectionRecord ? rejectionRecord.notes : null
      };
    });

    res.json({ medicines: enriched });
  } catch (error) {
    console.error('Error in my-submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
