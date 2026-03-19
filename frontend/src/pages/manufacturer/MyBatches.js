import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function MyBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/batches/my-batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBatches(data.batches);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch batches' });
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>My Batches</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No batches found. Create your first batch to get started.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>MAL Number</th>
                <th>Quantity</th>
                <th>Manufacture Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id}>
                  <td><span className="batch-id-display">{batch.batchId}</span></td>
                  <td>{batch.medicineName}</td>
                  <td>{batch.categoryName}</td>
                  <td><span className="mal-number-display">{batch.malNumber}</span></td>
                  <td>{batch.quantity}</td>
                  <td>{formatDate(batch.manufactureDate)}</td>
                  <td>{formatDate(batch.expiryDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(batch.status)}`}>
                      {batch.status}
                    </span>
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
