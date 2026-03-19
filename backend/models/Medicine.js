const fs = require('fs');
const path = require('path');

const MEDICINES_FILE = path.join(__dirname, 'medicines.json');

function loadMedicines() {
  try {
    if (!fs.existsSync(MEDICINES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(MEDICINES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading medicines:', err);
    return [];
  }
}

function saveMedicines(medicines) {
  try {
    fs.writeFileSync(MEDICINES_FILE, JSON.stringify(medicines, null, 2));
  } catch (err) {
    console.error('Error saving medicines:', err);
  }
}

function createMedicine(data) {
  const medicines = loadMedicines();

  // Check for duplicate registration number
  if (data.registrationNumber) {
    const duplicate = medicines.find(m => m.registrationNumber === data.registrationNumber);
    if (duplicate) {
      throw new Error('Registration number already exists');
    }
  }

  const medicine = {
    id: data.id || require('uuid').v4(),
    medicineName: data.medicineName,
    category: data.category,
    companyName: data.companyName,
    registrationNumber: data.registrationNumber,
    contactEmail: data.contactEmail,
    approvalDocument: data.approvalDocument || null,
    status: data.status || 'pending',
    malNumber: data.malNumber || null,
    submittedAt: data.submittedAt || Date.now(),
    submittedBy: data.submittedBy
  };

  medicines.push(medicine);
  saveMedicines(medicines);
  return medicine;
}

function getMedicineById(id) {
  const medicines = loadMedicines();
  return medicines.find(m => m.id === id);
}

function getMedicinesByStatus(status) {
  const medicines = loadMedicines();
  return medicines.filter(m => m.status === status);
}

function getMedicinesBySubmitter(userId) {
  const medicines = loadMedicines();
  return medicines.filter(m => m.submittedBy === userId);
}

function updateMedicineStatus(id, status, malNumber = null) {
  const medicines = loadMedicines();
  const index = medicines.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error('Medicine not found');
  }

  medicines[index].status = status;
  if (malNumber) {
    medicines[index].malNumber = malNumber;
  }

  saveMedicines(medicines);
  return medicines[index];
}

function getApprovedMedicines() {
  return getMedicinesByStatus('approved');
}

module.exports = {
  loadMedicines,
  saveMedicines,
  createMedicine,
  getMedicineById,
  getMedicinesByStatus,
  getMedicinesBySubmitter,
  updateMedicineStatus,
  getApprovedMedicines
};
