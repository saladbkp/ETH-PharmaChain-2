import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function GenerateQR() {
  const [inventory, setInventory] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    fetchInventory(role);
  }, []);

  const fetchInventory = async (role) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let apiUrl;

      // Admin gets all approved batches, others get their inventory
      if (role === 'admin') {
        apiUrl = 'http://localhost:5000/api/batches/approved';
      } else {
        apiUrl = 'http://localhost:5000/api/inventory/my-inventory';
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Admin response has { batches: [] }, others have { inventory: [] }
        setInventory(role === 'admin' ? data.batches : data.inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBatch) {
      setMessage({ type: 'error', text: 'Please select a batch' });
      return;
    }

    setGenerating(true);
    setMessage({ type: '', text: '' });

    try {
      // Get the selected batch from inventory
      const batch = inventory.find(item => item.batchId === selectedBatch);

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Generate QR code with enhanced data structure
      const qrData = {
        mal: batch.malNumber,
        batch: batch.batchId,
        medicine: batch.medicineName,
        category: batch.categoryName,
        quantity: batch.quantity,
        manufactureDate: batch.manufactureDate,
        expiryDate: batch.expiryDate,
        verified: true,
        generatedAt: Date.now(),
        generatedBy: userRole
      };

      // Generate QR code using a simple QR code library or API
      const jsonString = JSON.stringify(qrData);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonString)}`;

      setQRCode(qrApiUrl);
      setMessage({ type: 'success', text: 'QR code generated successfully!' });
    } catch (error) {
      console.error('Error generating QR code:', error);
      setMessage({ type: 'error', text: 'Failed to generate QR code' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qr-${selectedBatch}-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getSelectedBatchDetails = () => {
    return inventory.find(item => item.batchId === selectedBatch);
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <h2>Generate QR Code {userRole === 'admin' ? '(Admin)' : ''}</h2>
      {userRole === 'admin' && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px', fontSize: '14px' }}>
          👑 <strong>Admin Mode:</strong> You can generate QR codes for all approved batches in the system.
        </div>
      )}

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Select Batch</h3>
          </div>
          <div className="card-body">
            {inventory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-text">No inventory available. Add stock to generate QR codes.</div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Select Batch *</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a batch from your inventory</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.batchId}>
                        {item.medicineName} - Batch: {item.batchId} (Qty: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedBatchDetails() && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Batch Details:</h4>
                    <div><strong>Medicine:</strong> {getSelectedBatchDetails().medicineName}</div>
                    <div><strong>Category:</strong> {getSelectedBatchDetails().categoryName}</div>
                    <div><strong>MAL Number:</strong> {getSelectedBatchDetails().malNumber}</div>
                    <div><strong>Batch ID:</strong> {getSelectedBatchDetails().batchId}</div>
                    <div><strong>Quantity:</strong> {getSelectedBatchDetails().quantity}</div>
                    <div><strong>Expiry Date:</strong> {new Date(getSelectedBatchDetails().expiryDate).toLocaleDateString()}</div>
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={handleGenerate}
                    className="btn btn-primary"
                    disabled={!selectedBatch || generating}
                    style={{ width: '100%' }}
                  >
                    {generating ? <span className="loading-spinner"></span> : 'Generate QR Code'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">QR Code</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            {qrCode ? (
              <>
                <img
                  src={qrCode}
                  alt="QR Code"
                  style={{ maxWidth: '100%', maxHeight: '300px', border: '2px solid #ddd', borderRadius: '8px' }}
                />
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={handleDownload}
                    className="btn btn-success"
                    style={{ marginRight: '10px' }}
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={() => setQRCode(null)}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📱</div>
                <div className="empty-state-text">Select a batch and generate QR code</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">QR Code Information</h3>
        </div>
        <div className="card-body">
          <p>The generated QR code will contain the following information:</p>
          <ul>
            <li><strong>MAL Number:</strong> Unique medicine identifier</li>
            <li><strong>Batch ID:</strong> Specific batch identifier</li>
            <li><strong>Medicine Name:</strong> Name of the medicine</li>
            <li><strong>Category:</strong> Medicine category</li>
            <li><strong>Quantity:</strong> Quantity in this batch</li>
            <li><strong>Expiry Date:</strong> Batch expiration date</li>
            <li><strong>Verification Status:</strong> authenticity marker</li>
          </ul>
          <p><strong>Note:</strong> This QR code can be scanned to verify medicine authenticity and view detailed information.</p>
        </div>
      </div>
    </div>
  );
}
