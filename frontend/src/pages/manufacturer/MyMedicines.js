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
  badgeRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  badgePending: {
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  malNumber: {
    fontFamily: 'monospace',
    backgroundColor: '#e3f2fd',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  documentLink: {
    color: '#007bff',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer'
  }
};

export default function MyMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medicines/my-submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMedicines(data.medicines);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch medicines' });
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return styles.badgeApproved;
      case 'rejected': return styles.badgeRejected;
      case 'pending': return styles.badgePending;
      default: return styles.badgePending;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const filteredMedicines = medicines.filter(med => {
    if (filter === 'all') return true;
    return med.status === filter;
  });

  const stats = {
    total: medicines.length,
    approved: medicines.filter(m => m.status === 'approved').length,
    rejected: medicines.filter(m => m.status === 'rejected').length,
    pending: medicines.filter(m => m.status === 'pending').length
  };

  return (
    <div className="dashboard-content">
      <h2>My Medicine Registrations</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total</div>
        </div>
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
            {stats.approved}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Approved</div>
        </div>
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending</div>
        </div>
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
            {stats.rejected}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Rejected</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '5px 15px', fontSize: '12px', marginRight: '5px' }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-secondary'}`}
          style={{ padding: '5px 15px', fontSize: '12px', marginRight: '5px' }}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-secondary'}`}
          style={{ padding: '5px 15px', fontSize: '12px', marginRight: '5px' }}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '5px 15px', fontSize: '12px' }}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading medicine registrations...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💊</div>
          <div className="empty-state-text">No medicine registrations found. Submit your first medicine to get started.</div>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">No medicines found for filter: {filter}</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted Date</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Company Name</th>
                <th>Registration Number</th>
                <th>MAL Number</th>
                <th>Contact Email</th>
                <th>Document</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map(med => (
                <tr key={med.id}>
                  <td>{formatDate(med.submittedAt)}</td>
                  <td><strong>{med.medicineName}</strong></td>
                  <td>{med.categoryName || med.category}</td>
                  <td>{med.companyName}</td>
                  <td>{med.registrationNumber || '-'}</td>
                  <td>
                    {med.malNumber ? (
                      <span style={styles.malNumber}>{med.malNumber}</span>
                    ) : '-'}
                  </td>
                  <td>{med.contactEmail}</td>
                  <td>
                    {med.approvalDocument ? (
                      <a
                        href={`http://localhost:5000/uploads/documents/${med.approvalDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.documentLink}
                      >
                        📄 View
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    <span style={{ ...styles.badge, ...getStatusBadgeClass(med.status) }}>
                      {med.status}
                    </span>
                  </td>
                  <td>
                    {med.rejectionNotes ? (
                      <span style={{ color: '#dc3545', fontSize: '13px' }}>
                        {med.rejectionNotes}
                      </span>
                    ) : med.status === 'approved' ? (
                      <span style={{ color: '#28a745', fontSize: '13px' }}>
                        Approved
                      </span>
                    ) : (
                      <span style={{ color: '#856404', fontSize: '13px' }}>
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
