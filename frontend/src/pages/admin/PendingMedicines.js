import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

export default function PendingMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingMedicines();
  }, []);

  const fetchPendingMedicines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medicines/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMedicines(data.medicines);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch pending medicines' });
      }
    } catch (error) {
      console.error('Error fetching pending medicines:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (medicineId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medicines/${medicineId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Medicine approved with MAL: ${data.medicine.malNumber}` });
        fetchPendingMedicines();
      } else {
        setMessage({ type: 'error', text: data.message || 'Approval failed' });
      }
    } catch (error) {
      console.error('Error approving medicine:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleReject = async (medicineId) => {
    // eslint-disable-next-line no-restricted-globals
    const notes = window.prompt('Enter reason for rejection:');
    if (notes === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/medicines/${medicineId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Medicine rejected successfully' });
        fetchPendingMedicines();
      } else {
        setMessage({ type: 'error', text: data.message || 'Rejection failed' });
      }
    } catch (error) {
      console.error('Error rejecting medicine:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const viewDocument = (documentPath) => {
    if (documentPath) {
      window.open(`http://localhost:5000/uploads/documents/${documentPath}`, '_blank');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>Pending Medicine Approvals</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading pending medicines...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <div className="empty-state-text">No pending medicines to review.</div>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Company Name</th>
                <th>Registration #</th>
                <th>Contact Email</th>
                <th>Document</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id}>
                  <td>{med.medicineName}</td>
                  <td>{med.categoryName || med.category}</td>
                  <td>{med.companyName}</td>
                  <td>{med.registrationNumber || 'N/A'}</td>
                  <td>{med.contactEmail}</td>
                  <td>
                    {med.approvalDocument ? (
                      <button
                        onClick={() => viewDocument(med.approvalDocument)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        View
                      </button>
                    ) : (
                      'No document'
                    )}
                  </td>
                  <td>{formatDate(med.submittedAt)}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(med.id)}
                      className="btn btn-success"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                      disabled={!med.approvalDocument}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(med.id)}
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
