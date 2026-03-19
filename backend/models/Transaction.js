const fs = require('fs');
const path = require('path');

const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

function loadTransactions() {
  try {
    if (!fs.existsSync(TRANSACTIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading transactions:', err);
    return [];
  }
}

function saveTransactions(transactions) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (err) {
    console.error('Error saving transactions:', err);
  }
}

function createTransaction(data) {
  const transactions = loadTransactions();

  const transaction = {
    id: data.id || require('uuid').v4(),
    batchId: data.batchId,
    fromUserId: data.fromUserId || null,
    toUserId: data.toUserId,
    quantity: data.quantity,
    transactionType: data.transactionType, // 'transfer', 'stock_add', 'stock_reduce'
    createdAt: data.createdAt || Date.now(),
    txHash: data.txHash || null,
    notes: data.notes || null
  };

  transactions.push(transaction);
  saveTransactions(transactions);
  return transaction;
}

function getTransactionsByUser(userId) {
  const transactions = loadTransactions();
  return transactions.filter(t =>
    String(t.fromUserId) === String(userId) || String(t.toUserId) === String(userId)
  );
}

function getTransactionsByBatch(batchId) {
  const transactions = loadTransactions();
  return transactions.filter(t => t.batchId === batchId);
}

function getTransactionsByType(type) {
  const transactions = loadTransactions();
  return transactions.filter(t => t.transactionType === type);
}

function getAllTransactions() {
  return loadTransactions();
}

function getTransactionById(id) {
  const transactions = loadTransactions();
  return transactions.find(t => t.id === id);
}

module.exports = {
  loadTransactions,
  saveTransactions,
  createTransaction,
  getTransactionsByUser,
  getTransactionsByBatch,
  getTransactionsByType,
  getAllTransactions,
  getTransactionById
};
