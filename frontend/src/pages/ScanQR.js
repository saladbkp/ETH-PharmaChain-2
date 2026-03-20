import { useState, useRef } from 'react';
import '../styles/Dashboard.css';

export default function ScanQR() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      // For a real implementation, you would use a QR code scanning library
      // like jsQR or react-qr-reader to decode the QR code from the image
      // For now, we'll simulate the scan with a timeout

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated QR data (in real implementation, this would come from the QR code)
      const simulatedData = {
        mal: 'MAL202600001A',
        batch: 'BATCH-12345',
        medicine: 'Paracetamol 500mg',
        category: 'Analgesics',
        quantity: 1000,
        manufactureDate: '2024-01-15',
        expiryDate: '2026-01-15',
        verified: true,
        generatedAt: Date.now()
      };

      setScanResult(simulatedData);
    } catch (err) {
      setError('Failed to scan QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMALNumber = (malNumber) => {
    // Basic MAL number format validation
    const pattern = /^MAL\d{4}\d{5}[A-Z]$/;
    return pattern.test(malNumber);
  };

  const checkExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiry < now) {
      return { status: 'expired', color: '#e74c3c', label: 'Expired' };
    } else if (expiry <= thirtyDaysFromNow) {
      return { status: 'expiring-soon', color: '#f39c12', label: 'Expiring Soon' };
    } else {
      return { status: 'valid', color: '#27ae60', label: 'Valid' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const resetScan = () => {
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Scan QR Code</h2>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Scan QR Code</h3>
        </div>
        <div className="card-body">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="qr-upload"
          />
          <label htmlFor="qr-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
            📱 Choose QR Code Image
          </label>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Scanning QR code...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {scanResult && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scan Result</h3>
            <button onClick={resetScan} className="btn btn-secondary">
              Scan Another
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-2">
              {/* Verification Status */}
              <div className="card" style={{
                padding: '15px',
                textAlign: 'center',
                border: '2px solid',
                borderColor: scanResult.verified ? '#27ae60' : '#e74c3c'
              }}>
                <div style={{ fontSize: '2rem' }}>
                  {scanResult.verified ? '✓' : '✗'}
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: scanResult.verified ? '#27ae60' : '#e74c3c'
                }}>
                  {scanResult.verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>

              {/* MAL Number Validation */}
              <div className="card" style={{
                padding: '15px',
                textAlign: 'center',
                border: '2px solid',
                borderColor: verifyMALNumber(scanResult.mal) ? '#27ae60' : '#e74c3c'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  MAL Number
                </div>
                <div style={{ fontSize: '1.5rem', color: '#2c3e50' }}>
                  {scanResult.mal || 'N/A'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: verifyMALNumber(scanResult.mal) ? '#27ae60' : '#e74c3c'
                }}>
                  {verifyMALNumber(scanResult.mal) ? 'Valid Format' : 'Invalid Format'}
                </div>
              </div>
            </div>

            {/* Medicine Information */}
            <h4 style={{ margin: '20px 0 10px 0' }}>Medicine Information</h4>
            <div className="data-table-container">
              <table className="data-table">
                <tbody>
                  <tr>
                    <td><strong>Medicine Name</strong></td>
                    <td>{scanResult.medicine || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Category</strong></td>
                    <td>{scanResult.category || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Batch ID</strong></td>
                    <td>{scanResult.batch || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Quantity / units</strong></td>
                    <td>{scanResult.quantity || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Manufacture Date</strong></td>
                    <td>{formatDate(scanResult.manufactureDate)}</td>
                  </tr>
                  <tr>
                    <td><strong>Expiry Date</strong></td>
                    <td>
                      {formatDate(scanResult.expiryDate)}
                      {' '}
                      {scanResult.expiryDate && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: checkExpiryStatus(scanResult.expiryDate).color + '20',
                            color: checkExpiryStatus(scanResult.expiryDate).color
                          }}
                        >
                          {checkExpiryStatus(scanResult.expiryDate).label}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Info */}
            {scanResult.generatedAt && (
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                QR Generated: {formatDate(scanResult.generatedAt)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!scanResult && !loading && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">How to Scan</h3>
          </div>
          <div className="card-body">
            <ol>
              <li>Click "Choose QR Code Image" to select an image containing a QR code</li>
              <li>The system will decode and display the medicine information</li>
              <li>Verify the MAL number format and check expiry status</li>
            </ol>
            <p><strong>Note:</strong> QR codes contain detailed medicine information including MAL number, batch details, and verification status.</p>
          </div>
        </div>
      )}
    </div>
  );
}
