const { getApprovalHistoryByType } = require('./models/ApprovalHistory');
const { getAllBatches } = require('./models/Batch');
const { getMedicineById } = require('./models/Medicine');

console.log('=== Testing Batch History API ===\n');

try {
  // Get batch approval history
  const history = getApprovalHistoryByType('batch');
  console.log('Batch history records:', history.length);
  console.log('History:', JSON.stringify(history, null, 2));

  // Get all batches
  const batches = getAllBatches();
  console.log('\nAll batches:', batches.length);

  // Enrich history
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

  console.log('\nEnriched history:', JSON.stringify(enriched, null, 2));
  console.log('\n✅ Test passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
}
