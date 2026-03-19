import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import jsQR from 'jsqr';
import '../styles/Dashboard.css';

export default function ScanTransaction() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        // It's an image file - decode QR code from image
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code && code.data) {
              processQRData(code.data);
            } else {
              setError('No QR code found in the uploaded image. Please try another image.');
            }
            setLoading(false);
          };
          img.onerror = () => {
            setError('Failed to load image. Please try another file.');
            setLoading(false);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);

      } else {
        // It's a text/JSON file - read as text
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target.result;
            let jsonData = null;

            // Try to parse as JSON directly
            try {
              jsonData = JSON.parse(text);
            } catch (err) {
              // If not valid JSON, try to extract JSON from text
              const jsonMatch = text.match(/\{[^}]+\}/);
              if (jsonMatch) {
                jsonData = JSON.parse(jsonMatch[0]);
              }
            }

            if (jsonData && (jsonData.mal || jsonData.batch || jsonData.medicine)) {
              processQRData(jsonData);
            } else {
              setError('Invalid QR code format. No medicine information found.');
            }
          } catch (err) {
            setError('Failed to read QR code data. Please try again.');
          }
          setLoading(false);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process file. Please try again.');
      setLoading(false);
    }
  };

  const processQRData = (data) => {
    try {
      let qrData;

      if (typeof data === 'string') {
        // Try to parse JSON string
        qrData = JSON.parse(data);
      } else {
        qrData = data;
      }

      // Validate that it's medicine QR data
      if (qrData.mal || qrData.batch || qrData.medicine) {
        setScanResult(qrData);
        setError('');
      } else {
        setError('Invalid QR code format. Not a medicine QR code.');
      }
    } catch (err) {
      console.error('Error parsing QR data:', err);
      setError('Invalid QR code data format.');
    }
  };

  const verifyMALNumber = (malNumber) => {
    if (!malNumber) return false;
    // Basic MAL number format validation
    const pattern = /^MAL\d{4}\d{5}[A-Z]$/;
    return pattern.test(malNumber);
  };

  const checkExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', color: '#95a5a6', label: 'Unknown' };

    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (isNaN(expiry.getTime())) {
      return { status: 'unknown', color: '#95a5a6', label: 'Unknown' };
    }

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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const resetScan = () => {
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate('/')}
        style={styles.homeButton}
        title="back to homepage"
      >
        <FaHome /> home
      </button>
      <h2 style={styles.title}>Scan QR Code</h2>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Upload QR Code Image</h3>
        </div>
        <div style={styles.cardBody}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.json,.txt"
            onChange={handleFileUpload}
            style={styles.fileInput}
            disabled={loading}
          />
          <p style={styles.helpText}>
            Select a QR code image (JPG, PNG) or a file containing QR data (JSON/TXT)
          </p>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>

      {loading && (
        <div style={styles.card}>
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
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Scan Result</h3>
            <button onClick={resetScan} className="btn btn-secondary" style={{ padding: '5px 15px' }}>
              Scan Another
            </button>
          </div>
          <div style={styles.cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Verification Status */}
              <div style={{
                padding: '15px',
                textAlign: 'center',
                border: '2px solid',
                borderColor: scanResult.verified ? '#27ae60' : '#e74c3c',
                borderRadius: '8px'
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
              <div style={{
                padding: '15px',
                textAlign: 'center',
                border: '2px solid',
                borderColor: verifyMALNumber(scanResult.mal) ? '#27ae60' : '#e74c3c',
                borderRadius: '8px'
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
                    <td><strong>Quantity</strong></td>
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
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>How to Scan</h3>
          </div>
          <div style={styles.cardBody}>
            <ol style={{ lineHeight: '1.8' }}>
              <li>Click "Choose File" to select a QR code image (JPG, PNG)</li>
              <li>Or select a JSON/TXT file containing QR code data</li>
              <li>The system will decode and display the medicine information</li>
              <li>Verify the MAL number format and check expiry status</li>
            </ol>
            <p style={{ marginTop: '10px' }}><strong>Note:</strong> QR codes contain detailed medicine information including MAL number, batch details, and verification status.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Inline CSS styles
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  homeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#333',
  },
  cardBody: {
    padding: '20px',
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    border: '2px dashed #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  helpText: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
  },
};
