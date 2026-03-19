import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function PendingStock() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stock/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch pending requests' });
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/stock/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Stock change approved and processed' });
        fetchPendingRequests();
      } else {
        setMessage({ type: 'error', text: data.message || 'Approval failed' });
      }
    } catch (error) {
      console.error('Error approving stock change:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/stock/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Stock change rejected by admin' })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Stock change rejected successfully' });
        fetchPendingRequests();
      } else {
        setMessage({ type: 'error', text: data.message || 'Rejection failed' });
      }
    } catch (error) {
      console.error('Error rejecting stock change:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const getTransactionTypeLabel = (type) => {
    switch(type) {
      case 'stock_add': return 'Add Stock';
      case 'stock_reduce': return 'Reduce Stock';
      default: return type;
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Pending Stock Change Requests</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading pending requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <div className="empty-state-text">No pending stock change requests.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request Type</th>
                <th>Medicine Name</th>
                <th>MAL Number</th>
                <th>Batch ID</th>
                <th>Quantity</th>
                <th>User</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>
                    <span className={`status-badge ${req.transactionType === 'stock_add' ? 'approved' : 'pending'}`}>
                      {getTransactionTypeLabel(req.transactionType)}
                    </span>
                  </td>
                  <td>{req.medicineName}</td>
                  <td>{req.malNumber}</td>
                  <td>{req.batchId}</td>
                  <td>{req.quantity}</td>
                  <td>{req.fromUsername || req.toUsername || 'Unknown'}</td>
                  <td>{formatDate(req.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="btn btn-success"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Reject
                    </button>
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
