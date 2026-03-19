import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'retailer'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch users from backend - need to create this endpoint or use the existing users.json
      // For now, we'll show that admin can create users
      setStaff([]);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setMessage({ type: 'error', text: 'Username and password are required' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `User "${formData.username}" created successfully!` });
        setFormData({ username: '', password: '', confirmPassword: '', role: 'retailer' });
        fetchStaff(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'approved' : 'rejected';
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'approved';
      case 'manufacturer': return 'pending';
      case 'retailer': return 'rejected';
      default: return 'pending';
    }
  };

  const roleStats = {
    admin: staff.filter(s => s.role === 'admin').length,
    manufacturer: staff.filter(s => s.role === 'manufacturer').length,
    retailer: staff.filter(s => s.role === 'retailer').length,
    total: staff.length
  };

  return (
    <div className="dashboard-content">
      <h2>Manage Staff</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* User Creation Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create New User Account</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm password"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="retailer">Retailer</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? <span className="loading-spinner"></span> : 'Create User'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Existing Users</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              <p>User list is managed in the backend database.</p>
              <p>Contact your system administrator to view all users.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
