import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import '../../styles/Dashboard.css';

export default function RegisterMedicine() {
  const { isConnected, signMessage, verifyWalletForRole } = useWeb3();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    medicineName: '',
    category: '',
    companyName: '',
    contactEmail: '',
    approvalDocument: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [autoRegistrationNumber, setAutoRegistrationNumber] = useState('');

  useEffect(() => {
    fetchCategories();
    generateAutoRegistrationNumber();
  }, []);

  const generateAutoRegistrationNumber = () => {
    // Auto-generate registration number: REG-YYYYMMDD-5digits
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 chars
    const regNumber = `REG-${dateStr}-${randomStr}`;
    setAutoRegistrationNumber(regNumber);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Only PDF, JPG, JPEG, PNG files allowed' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        approvalDocument: file
      }));
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (!formData.medicineName.trim()) {
      setMessage({ type: 'error', text: 'Medicine name is required' });
      return false;
    }

    if (!formData.category) {
      setMessage({ type: 'error', text: 'Category is required' });
      return false;
    }

    if (!formData.companyName.trim()) {
      setMessage({ type: 'error', text: 'Company name is required' });
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.contactEmail)) {
      setMessage({ type: 'error', text: 'Invalid email format' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Step 1: Check wallet connection
    if (!isConnected) {
      setMessage({ type: 'error', text: '⚠️ Please connect your Manufacturer wallet first!' });
      return;
    }

    // Step 2: Verify wallet is manufacturer
    const verification = verifyWalletForRole('manufacturer');
    if (!verification.valid) {
      setMessage({ type: 'error', text: `⚠️ ${verification.message}` });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '🔐 Requesting wallet signature...' });

    try {
      // Step 3: Create signing message
      const signingData = {
        action: 'REGISTER_MEDICINE',
        medicineName: formData.medicineName,
        category: formData.category,
        companyName: formData.companyName,
        registrationNumber: autoRegistrationNumber,
        contactEmail: formData.contactEmail,
        timestamp: Date.now()
      };

      const messageToSign = JSON.stringify(signingData);

      // Step 4: Request wallet signature
      let signature;
      try {
        signature = await signMessage(messageToSign);
        setMessage({ type: '', text: '✅ Signature received! Submitting medicine...' });
      } catch (error) {
        setMessage({ type: 'error', text: `❌ Signature rejected: ${error.message}` });
        setLoading(false);
        return;
      }

      // Step 5: Submit to backend with signature
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('medicineName', formData.medicineName);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('registrationNumber', autoRegistrationNumber);
      formDataToSend.append('contactEmail', formData.contactEmail);
      formDataToSend.append('approvalDocument', formData.approvalDocument);
      formDataToSend.append('signature', signature);
      formDataToSend.append('signingMessage', messageToSign);
      formDataToSend.append('signingTimestamp', signingData.timestamp);

      const response = await fetch('http://localhost:5000/api/medicines/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Medicine submitted successfully! Pending admin approval.' });
        setFormData({
          medicineName: '',
          category: '',
          companyName: '',
          contactEmail: '',
          approvalDocument: null
        });
        generateAutoRegistrationNumber();
        document.getElementById('approvalDocument').value = '';
      } else {
        setMessage({ type: 'error', text: `❌ ${data.message || 'Submission failed'}` });
      }
    } catch (error) {
      console.error('Error submitting medicine:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Register New Medicine</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-medicine-form">
        <div className="form-group">
          <label className="form-label">Medicine Name *</label>
          <input
            type="text"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter medicine name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Registration Number (Auto-Generated)</label>
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#495057'
          }}>
            {autoRegistrationNumber}
          </div>
          <small style={{ color: '#6c757d' }}>Registration number is auto-generated in format: REG-YYYYMMDD-XXXXX</small>
        </div>

        <div className="form-group">
          <label className="form-label">Contact Email *</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="form-input"
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Approval Document *</label>
          <input
            id="approvalDocument"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="form-input"
            required
          />
          <small>PDF, JPG, JPEG, PNG files only (max 5MB)</small>
          {formData.approvalDocument && (
            <div style={{ marginTop: '5px', color: '#27ae60' }}>
              Selected: {formData.approvalDocument.name}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <span className="loading-spinner"></span> : 'Submit Medicine'}
        </button>
      </form>
    </div>
  );
}
