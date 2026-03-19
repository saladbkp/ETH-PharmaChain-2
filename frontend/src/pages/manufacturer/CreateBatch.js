import { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

// Helper function to format MAL number
const formatMALNumber = (malNumber) => {
  if (!malNumber) return 'N/A';
  const pattern = /^MAL(\d{4})(\d{5})([A-Z])$/;
  const match = malNumber.match(pattern);
  if (match) {
    const [, year, sequence, checksum] = match;
    return `MAL ${year} ${sequence}${checksum}`;
  }
  return malNumber;
};

export default function CreateBatch() {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    medicineId: '',
    quantity: '',
    manufactureDate: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [autoBatchId, setAutoBatchId] = useState('');

  useEffect(() => {
    fetchMedicines();
    generateAutoBatchId();
  }, []);

  const generateAutoBatchId = () => {
    // Auto-generate batch ID: BATCH-YYYYMMDD-5digits
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 chars
    const batchId = `BATCH-${dateStr}-${randomStr}`;
    setAutoBatchId(batchId);
  };

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medicines/approved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.medicineId) {
      setMessage({ type: 'error', text: 'Please select a medicine' });
      return false;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return false;
    }

    if (!formData.manufactureDate) {
      setMessage({ type: 'error', text: 'Manufacture date is required' });
      return false;
    }

    if (!formData.expiryDate) {
      setMessage({ type: 'error', text: 'Expiry date is required' });
      return false;
    }

    const manufacture = new Date(formData.manufactureDate);
    const expiry = new Date(formData.expiryDate);
    const now = new Date();

    if (manufacture > now) {
      setMessage({ type: 'error', text: 'Manufacture date cannot be in the future' });
      return false;
    }

    if (expiry <= manufacture) {
      setMessage({ type: 'error', text: 'Expiry date must be after manufacture date' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/batches/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicineId: formData.medicineId,
          batchId: autoBatchId, // Use auto-generated batch ID
          quantity: parseInt(formData.quantity),
          manufactureDate: formData.manufactureDate,
          expiryDate: formData.expiryDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Batch created successfully! Pending admin approval.' });
        setFormData({
          medicineId: '',
          quantity: '',
          manufactureDate: '',
          expiryDate: ''
        });
        generateAutoBatchId(); // Generate new batch ID for next time
      } else {
        setMessage({ type: 'error', text: data.message || 'Batch creation failed' });
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMedicine = () => {
    return medicines.find(m => m.id === formData.medicineId);
  };

  return (
    <div className="dashboard-content">
      <h2>Create New Batch</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-medicine-form">
        <div className="form-group">
          <label className="form-label">Select Medicine *</label>
          <select
            name="medicineId"
            value={formData.medicineId}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select an approved medicine</option>
            {medicines.map(med => (
              <option key={med.id} value={med.id}>
                {med.medicineName} - {med.categoryName} (MAL: {med.malNumber})
              </option>
            ))}
          </select>
          {getSelectedMedicine() && (
            <div style={{ marginTop: '5px' }}>
              <span className="mal-number-display">{formatMALNumber(getSelectedMedicine().malNumber)}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Batch ID (Auto-Generated)</label>
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#495057'
          }}>
            {autoBatchId}
          </div>
          <small style={{ color: '#6c757d' }}>Batch ID is auto-generated in format: BATCH-YYYYMMDD-XXXXX</small>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter quantity"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Manufacture Date *</label>
          <input
            type="date"
            name="manufactureDate"
            value={formData.manufactureDate}
            onChange={handleChange}
            className="form-input"
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Date *</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="form-input"
            min={formData.manufactureDate || ''}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <span className="loading-spinner"></span> : 'Create Batch'}
        </button>
      </form>
    </div>
  );
}
