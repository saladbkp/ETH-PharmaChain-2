import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function PendingTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const fetchPendingTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/transfers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTransfers(data.transfers);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch pending transfers' });
      }
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Transfer approved and inventory updated successfully' });
        fetchPendingTransfers();
      } else {
        setMessage({ type: 'error', text: data.message || 'Approval failed' });
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (transferId) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/transfers/${transferId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Transfer rejected by admin' })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Transfer rejected successfully' });
        fetchPendingTransfers();
      } else {
        setMessage({ type: 'error', text: data.message || 'Rejection failed' });
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>Pending Transfer Requests</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading pending transfers...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No pending transfer requests.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>MAL Number</th>
                <th>Batch ID</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id}>
                  <td>{transfer.medicineName}</td>
                  <td>{transfer.malNumber}</td>
                  <td>{transfer.batchId}</td>
                  <td>{transfer.quantity}</td>
                  <td>{transfer.fromUsername}</td>
                  <td>{transfer.toUsername}</td>
                  <td>{formatDate(transfer.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(transfer.id)}
                      className="btn btn-success"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                      disabled={submitting}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(transfer.id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      disabled={submitting}
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
