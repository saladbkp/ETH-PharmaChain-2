const fs = require('fs');
const path = require('path');

const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

function loadCategories() {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading categories:', err);
    return [];
  }
}

function saveCategories(categories) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

function createCategory(data) {
  const categories = loadCategories();

  // Check for duplicate name
  const duplicate = categories.find(c => c.name.toLowerCase() === data.name.toLowerCase());
  if (duplicate) {
    throw new Error('Category name already exists');
  }

  const category = {
    id: data.id || require('uuid').v4(),
    name: data.name.trim(),
    createdAt: data.createdAt || Date.now(),
    createdBy: data.createdBy
  };

  categories.push(category);
  saveCategories(categories);
  return category;
}

function getCategoryById(id) {
  const categories = loadCategories();
  return categories.find(c => c.id === id);
}

function getAllCategories() {
  return loadCategories();
}

function updateCategory(id, data) {
  const categories = loadCategories();
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error('Category not found');
  }

  // Check for duplicate name (excluding current category)
  if (data.name) {
    const duplicate = categories.find(c =>
      c.id !== id && c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error('Category name already exists');
    }
    categories[index].name = data.name.trim();
  }

  saveCategories(categories);
  return categories[index];
}

function deleteCategory(id) {
  const categories = loadCategories();
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error('Category not found');
  }

  categories.splice(index, 1);
  saveCategories(categories);
  return true;
}

module.exports = {
  loadCategories,
  saveCategories,
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory
};
