import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import '../../styles/Dashboard.css';

export default function PendingBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { isConnected, verifyWalletForRole, signMessage, correctNetwork } = useWeb3();

  useEffect(() => {
    fetchPendingBatches();
  }, []);

  const fetchPendingBatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/batches/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBatches(data.batches);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch pending batches' });
      }
    } catch (error) {
      console.error('Error fetching pending batches:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (batchId) => {
    // Check wallet connection
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect your wallet first!' });
      return;
    }

    // Check if connected to correct network
    if (!correctNetwork) {
      setMessage({ type: 'error', text: 'Please connect to Ganache network (Chain ID: 1337)' });
      return;
    }

    // Verify wallet matches admin role
    const verification = verifyWalletForRole('admin');
    if (!verification.valid) {
      setMessage({ type: 'error', text: verification.message });
      return;
    }

    try {
      // Create approval message to sign
      const approvalMessage = `Approve batch ${batchId} at ${new Date().toISOString()}`;

      // Request wallet signature
      let signature;
      try {
        signature = await signMessage(approvalMessage);
      } catch (signError) {
        setMessage({ type: 'error', text: 'Signature rejected by user' });
        return;
      }

      // Send approval request with signature
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/batches/${batchId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          message: approvalMessage,
          timestamp: Date.now()
        })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Batch approved and added to inventory' });
        fetchPendingBatches();
      } else {
        setMessage({ type: 'error', text: data.message || 'Approval failed' });
      }
    } catch (error) {
      console.error('Error approving batch:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleReject = async (batchId) => {
    // Check wallet connection
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect your wallet first!' });
      return;
    }

    // Check if connected to correct network
    if (!correctNetwork) {
      setMessage({ type: 'error', text: 'Please connect to Ganache network (Chain ID: 1337)' });
      return;
    }

    // Verify wallet matches admin role
    const verification = verifyWalletForRole('admin');
    if (!verification.valid) {
      setMessage({ type: 'error', text: verification.message });
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    const notes = window.prompt('Enter reason for rejection:');
    if (notes === null) return; // User cancelled

    try {
      // Create rejection message to sign
      const rejectMessage = `Reject batch ${batchId} at ${new Date().toISOString()}`;

      // Request wallet signature
      let signature;
      try {
        signature = await signMessage(rejectMessage);
      } catch (signError) {
        setMessage({ type: 'error', text: 'Signature rejected by user' });
        return;
      }

      // Send rejection request with signature
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/batches/${batchId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes,
          signature,
          message: rejectMessage,
          timestamp: Date.now()
        })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '❌ Batch rejected successfully' });
        fetchPendingBatches();
      } else {
        setMessage({ type: 'error', text: data.message || 'Rejection failed' });
      }
    } catch (error) {
      console.error('Error rejecting batch:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>Pending Batch Approvals</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading pending batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <div className="empty-state-text">No pending batches to review.</div>
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
                <th>Submitted</th>
                <th>Actions</th>
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
                  <td>{formatDate(batch.submittedAt)}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(batch.id)}
                      className="btn btn-success"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(batch.id)}
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
