const fs = require('fs');
const path = require('path');

const APPROVAL_HISTORY_FILE = path.join(__dirname, 'approvalHistory.json');

function loadApprovalHistory() {
  try {
    if (!fs.existsSync(APPROVAL_HISTORY_FILE)) {
      return [];
    }
    const data = fs.readFileSync(APPROVAL_HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading approval history:', err);
    return [];
  }
}

function saveApprovalHistory(history) {
  try {
    fs.writeFileSync(APPROVAL_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('Error saving approval history:', err);
  }
}

function createApprovalRecord(data) {
  const history = loadApprovalHistory();

  const record = {
    id: data.id || require('uuid').v4(),
    entityType: data.entityType, // 'medicine', 'batch', 'stock_change'
    entityId: data.entityId,
    action: data.action, // 'approved', 'rejected'
    approvedBy: data.approvedBy,
    notes: data.notes || null,
    createdAt: data.createdAt || Date.now()
  };

  history.push(record);
  saveApprovalHistory(history);
  return record;
}

function getApprovalHistoryByEntity(entityType, entityId) {
  const history = loadApprovalHistory();
  return history.filter(h =>
    h.entityType === entityType && h.entityId === entityId
  );
}

function getApprovalHistoryByApprover(approverId) {
  const history = loadApprovalHistory();
  return history.filter(h => h.approvedBy === approverId);
}

function getApprovalHistoryByType(entityType) {
  const history = loadApprovalHistory();
  return history.filter(h => h.entityType === entityType);
}

function getAllApprovalHistory() {
  return loadApprovalHistory();
}

function getApprovalHistoryById(id) {
  const history = loadApprovalHistory();
  return history.find(h => h.id === id);
}

module.exports = {
  loadApprovalHistory,
  saveApprovalHistory,
  createApprovalRecord,
  getApprovalHistoryByEntity,
  getApprovalHistoryByApprover,
  getApprovalHistoryByType,
  getAllApprovalHistory,
  getApprovalHistoryById
};
