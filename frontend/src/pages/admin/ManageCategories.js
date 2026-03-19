import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Category name is required' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5000/api/categories/${editingId}`
        : 'http://localhost:5000/api/categories';

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: formData.name.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingId ? 'Category updated successfully' : 'Category created successfully'
        });
        setFormData({ name: '' });
        setEditingId(null);
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name });
    setEditingId(category.id);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (categoryId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Category deleted successfully' });
        fetchCategories();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '' });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="dashboard-content">
      <h2>Manage Categories</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h3>
          {editingId && (
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter category name"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? <span className="loading-spinner"></span> : editingId ? 'Update Category' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Existing Categories ({categories.length})</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No categories found. Create your first category.</div>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
