const fs = require('fs');
const path = require('path');

const INVENTORY_FILE = path.join(__dirname, 'inventory.json');

function loadInventory() {
  try {
    if (!fs.existsSync(INVENTORY_FILE)) {
      return [];
    }
    const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading inventory:', err);
    return [];
  }
}

function saveInventory(inventory) {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
  } catch (err) {
    console.error('Error saving inventory:', err);
  }
}

function getInventoryByUser(userId) {
  const inventory = loadInventory();
  return inventory.filter(item => String(item.userId) === String(userId));
}

function getInventoryItem(userId, batchId) {
  const inventory = loadInventory();
  return inventory.find(item => String(item.userId) === String(userId) && item.batchId === batchId);
}

function updateInventory(userId, batchId, quantityChange) {
  const inventory = loadInventory();
  const existingIndex = inventory.findIndex(
    item => String(item.userId) === String(userId) && item.batchId === batchId
  );

  if (existingIndex !== -1) {
    // Update existing item
    const newQuantity = inventory[existingIndex].quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Insufficient inventory');
    }

    if (newQuantity === 0) {
      // Remove item if quantity is zero
      inventory.splice(existingIndex, 1);
    } else {
      inventory[existingIndex].quantity = newQuantity;
      inventory[existingIndex].updatedAt = Date.now();
    }
  } else {
    // Add new item
    if (quantityChange <= 0) {
      throw new Error('Cannot add negative quantity');
    }
    inventory.push({
      id: require('uuid').v4(),
      batchId: batchId,
      userId: userId,
      quantity: quantityChange,
      updatedAt: Date.now()
    });
  }

  saveInventory(inventory);
  return getInventoryByUser(userId);
}

function setInventory(userId, batchId, quantity) {
  const inventory = loadInventory();
  const existingIndex = inventory.findIndex(
    item => String(item.userId) === String(userId) && item.batchId === batchId
  );

  if (existingIndex !== -1) {
    if (quantity <= 0) {
      inventory.splice(existingIndex, 1);
    } else {
      inventory[existingIndex].quantity = quantity;
      inventory[existingIndex].updatedAt = Date.now();
    }
  } else {
    if (quantity > 0) {
      inventory.push({
        id: require('uuid').v4(),
        batchId: batchId,
        userId: userId,
        quantity: quantity,
        updatedAt: Date.now()
      });
    }
  }

  saveInventory(inventory);
  return getInventoryByUser(userId);
}

function checkInventoryAvailable(userId, batchId, quantity) {
  const item = getInventoryItem(userId, batchId);
  return item && item.quantity >= quantity;
}

module.exports = {
  loadInventory,
  saveInventory,
  getInventoryByUser,
  getInventoryItem,
  updateInventory,
  setInventory,
  checkInventoryAvailable
};
