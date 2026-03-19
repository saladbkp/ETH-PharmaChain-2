import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
      } else {
        console.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionTypeLabel = (type) => {
    switch(type) {
      case 'transfer': return 'Transfer';
      case 'stock_add': return 'Stock Addition';
      case 'stock_reduce': return 'Stock Reduction';
      default: return type;
    }
  };

  const getTransactionTypeBadge = (type) => {
    switch(type) {
      case 'transfer': return 'approved';
      case 'stock_add': return 'approved';
      case 'stock_reduce': return 'pending';
      default: return 'pending';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'transfers') return tx.transactionType === 'transfer';
    if (filter === 'stock_changes') return tx.transactionType === 'stock_add' || tx.transactionType === 'stock_reduce';
    return true;
  });

  const stats = {
    total: transactions.length,
    transfers: transactions.filter(t => t.transactionType === 'transfer').length,
    stockChanges: transactions.filter(t => t.transactionType === 'stock_add' || t.transactionType === 'stock_reduce').length
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Transaction History</h2>
        <div>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 15px', fontSize: '12px', marginRight: '5px' }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('transfers')}
            className={`btn ${filter === 'transfers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 15px', fontSize: '12px', marginRight: '5px' }}
          >
            Transfers
          </button>
          <button
            onClick={() => setFilter('stock_changes')}
            className={`btn ${filter === 'stock_changes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 15px', fontSize: '12px' }}
          >
            Stock Changes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{stats.total}</div>
            <div style={{ color: '#666' }}>Total Transactions</div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>{stats.transfers}</div>
            <div style={{ color: '#666' }}>Transfers</div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>{stats.stockChanges}</div>
            <div style={{ color: '#666' }}>Stock Changes</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No transactions found.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Medicine Name</th>
                <th>MAL Number</th>
                <th>Batch ID</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getTransactionTypeBadge(tx.transactionType)}`}>
                      {getTransactionTypeLabel(tx.transactionType)}
                    </span>
                  </td>
                  <td>{tx.medicineName || 'N/A'}</td>
                  <td>{tx.malNumber ? <span className="mal-number-display">{tx.malNumber}</span> : 'N/A'}</td>
                  <td>{tx.batchId}</td>
                  <td>{tx.transactionType === 'stock_add' ? 'admin' : (tx.fromUsername || 'N/A')}</td>
                  <td>{tx.toUsername || 'N/A'}</td>
                  <td>{tx.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
