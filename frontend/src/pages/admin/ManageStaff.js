import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

const styles = {
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    display: 'inline-block'
  },
  badgeApproved: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  badgePending: {
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  badgeRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  }
};

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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.users || []);
      } else {
        console.error('Failed to fetch users');
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
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
    return status === 'active' ? styles.badgeApproved : styles.badgeRejected;
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return styles.badgeApproved;
      case 'manufacturer': return styles.badgePending;
      case 'retailer': return styles.badgeRejected;
      default: return styles.badgePending;
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
          <h3 className="card-title">Existing Users ({roleStats.total})</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : staff.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p>No users found. Create a new user account above.</p>
            </div>
          ) : (
            <>
              {/* User Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                    {roleStats.admin}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Admin</div>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#fff3e0',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
                    {roleStats.manufacturer}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Manufacturer</div>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f3e5f5',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>
                    {roleStats.retailer}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Retailer</div>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Username</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Role</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>#{user.id}</td>
                        <td style={{ padding: '12px', fontWeight: '500' }}>
                          {user.username}
                          {user.username === 'admin' && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              backgroundColor: '#ffd700',
                              color: '#333',
                              fontSize: '11px',
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>
                              SYSTEM
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ ...styles.badge, ...getRoleBadgeClass(user.role) }}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ ...styles.badge, ...getStatusBadgeClass('active') }}>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
