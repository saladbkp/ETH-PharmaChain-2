const fs = require('fs');
const path = require('path');

const BATCHES_FILE = path.join(__dirname, 'batches.json');

function loadBatches() {
  try {
    if (!fs.existsSync(BATCHES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BATCHES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading batches:', err);
    return [];
  }
}

function saveBatches(batches) {
  try {
    fs.writeFileSync(BATCHES_FILE, JSON.stringify(batches, null, 2));
  } catch (err) {
    console.error('Error saving batches:', err);
  }
}

function createBatch(data) {
  const batches = loadBatches();

  // Check for duplicate batch ID
  const duplicate = batches.find(b => b.batchId === data.batchId);
  if (duplicate) {
    throw new Error('Batch ID already exists');
  }

  const batch = {
    id: data.id || require('uuid').v4(),
    medicineId: data.medicineId,
    malNumber: data.malNumber,
    batchId: data.batchId,
    quantity: data.quantity,
    manufactureDate: data.manufactureDate,
    expiryDate: data.expiryDate,
    status: data.status || 'pending',
    manufacturerId: data.manufacturerId,
    submittedAt: data.submittedAt || Date.now(),
    approvedAt: null
  };

  batches.push(batch);
  saveBatches(batches);
  return batch;
}

function getBatchById(id) {
  const batches = loadBatches();
  return batches.find(b => b.id === id);
}

function getBatchesByStatus(status) {
  const batches = loadBatches();
  return batches.filter(b => b.status === status);
}

function getBatchesByManufacturer(manufacturerId) {
  const batches = loadBatches();
  return batches.filter(b => b.manufacturerId === manufacturerId);
}

function updateBatchStatus(id, status) {
  const batches = loadBatches();
  const index = batches.findIndex(b => b.id === id);

  if (index === -1) {
    throw new Error('Batch not found');
  }

  batches[index].status = status;
  if (status === 'approved') {
    batches[index].approvedAt = Date.now();
  }

  saveBatches(batches);
  return batches[index];
}

function getBatchesByMedicine(medicineId) {
  const batches = loadBatches();
  return batches.filter(b => b.medicineId === medicineId);
}

function getAllBatches() {
  return loadBatches();
}

module.exports = {
  loadBatches,
  saveBatches,
  createBatch,
  getBatchById,
  getBatchesByStatus,
  getBatchesByManufacturer,
  updateBatchStatus,
  getBatchesByMedicine,
  getAllBatches
};
