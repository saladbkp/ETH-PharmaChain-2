import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/my-inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setInventory(data.inventory);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch inventory' });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
  };

  return (
    <div className="dashboard-content">
      <h2>My Inventory</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading inventory...</p>
        </div>
      ) : inventory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No inventory found. Your stock will appear here after batches are approved.</div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-3" style={{ marginBottom: '20px' }}>
            <div className="card">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                  {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div style={{ color: '#666' }}>Total Items</div>
              </div>
            </div>
            <div className="card">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                  {inventory.length}
                </div>
                <div style={{ color: '#666' }}>Unique Batches</div>
              </div>
            </div>
            <div className="card">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                  {inventory.filter(item => isExpired(item.expiryDate)).length}
                </div>
                <div style={{ color: '#666' }}>Expired Batches</div>
              </div>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>MAL Number</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const expired = isExpired(item.expiryDate);
                  const expiringSoon = isExpiringSoon(item.expiryDate);

                  // Determine status based on backend status field first, then expiry date
                  const getStatusBadge = () => {
                    // Check backend approval status first
                    if (item.status === 'pending_approval') {
                      return <span className="status-badge pending">Pending Approval</span>;
                    }
                    if (item.status === 'rejected') {
                      return <span className="status-badge rejected">Rejected</span>;
                    }
                    // Fall back to expiry-based status
                    if (expired) {
                      return <span className="status-badge rejected">Expired</span>;
                    }
                    if (expiringSoon) {
                      return <span className="status-badge pending">Expiring Soon</span>;
                    }
                    return <span className="status-badge approved">Valid</span>;
                  };

                  return (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: expired ? '#fee' : expiringSoon ? '#ffc' : 'inherit'
                      }}
                    >
                      <td>{item.batchId}</td>
                      <td>{item.medicineName}</td>
                      <td>{item.categoryName}</td>
                      <td><span className="mal-number-display">{item.malNumber}</span></td>
                      <td>{item.quantity}</td>
                      <td>{formatDate(item.expiryDate)}</td>
                      <td>{getStatusBadge()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <strong>Legend:</strong> <span style={{ color: '#e74c3c' }}>■ Expired</span> | <span style={{ color: '#f39c12' }}>■ Expiring Soon (30 days)</span>
          </div>
        </>
      )}
    </div>
  );
}
