import { useState, useEffect, useMemo } from 'react';
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
  }
};

export default function BatchApprovalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBatchHistory();
  }, []);

  const fetchBatchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/batches/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('✅ Batch History API Response:', data);
      if (response.ok) {
        console.log('✅ History array length:', data.history?.length || 0);
        setHistory(data.history || []);
      } else {
        console.error('❌ Failed to fetch batch history:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching batch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getActionBadgeClass = (action) => {
    switch(action) {
      case 'approved': return styles.badgeApproved;
      case 'rejected': return styles.badgeRejected;
      default: return styles.badgePending;
    }
  };

  // Use useMemo to cache filtered results
  const filteredHistory = useMemo(() => {
    const filtered = history.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'approved') return item.action === 'approved';
      if (filter === 'rejected') return item.action === 'rejected';
      return true;
    });
    console.log('🔍 Filter:', filter, '| History:', history.length, '| Filtered:', filtered.length);
    return filtered;
  }, [history, filter]);

  const stats = {
    total: history.length,
    approved: history.filter(h => h.action === 'approved').length,
    rejected: history.filter(h => h.action === 'rejected').length
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Batch Approval History</h2>
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

      {/* Statistics */}
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
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Batches</div>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading batch approval history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No batch approval history found.</div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">No batch history found for filter: {filter}</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch ID</th>
                <th>Medicine Name</th>
                <th>Quantity / unit</th>
                <th>Expiry Date</th>
                <th>Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(record => (
                <tr key={record.id}>
                  <td>{formatDate(record.createdAt)}</td>
                  <td>
                    <strong>{record.batchId}</strong>
                  </td>
                  <td>{record.medicineName}</td>
                  <td>{record.quantity}</td>
                  <td>{formatExpiryDate(record.expiryDate)}</td>
                  <td>
                    <span style={{ ...styles.badge, ...getActionBadgeClass(record.action) }}>
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
