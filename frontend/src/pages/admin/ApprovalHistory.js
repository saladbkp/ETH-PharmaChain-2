import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function ApprovalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApprovalHistory();
  }, []);

  const fetchApprovalHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medicines/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history);
      } else {
        console.error('Failed to fetch approval history');
      }
    } catch (error) {
      console.error('Error fetching approval history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeClass = (action) => {
    switch(action) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const getEntityBadgeClass = (entityType) => {
    switch(entityType) {
      case 'medicine': return 'approved';
      case 'batch': return 'pending';
      case 'stock_change': return 'rejected';
      default: return 'pending';
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'approved') return item.action === 'approved';
    if (filter === 'rejected') return item.action === 'rejected';
    return true;
  });

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Approval History</h2>
        <div>
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
            onClick={() => setFilter('rejected')}
            className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '5px 15px', fontSize: '12px' }}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading approval history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No approval history found.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entity Type</th>
                <th>Medicine Name</th>
                <th>Company Name</th>
                <th>MAL Number</th>
                <th>Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(record => (
                <tr key={record.id}>
                  <td>{formatDate(record.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getEntityBadgeClass(record.entityType)}`}>
                      {record.entityType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{record.medicineName}</td>
                  <td>{record.companyName}</td>
                  <td>{record.malNumber || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getActionBadgeClass(record.action)}`}>
                      {record.action}
                    </span>
                  </td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
