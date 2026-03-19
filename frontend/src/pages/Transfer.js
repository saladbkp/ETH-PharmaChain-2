import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/Dashboard.css';

export default function TransferPage() {
  const { isConnected, signMessage, verifyWalletForRole } = useWeb3();

  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    batchId: '',
    quantity: '',
    receiverId: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInventory();
    fetchUsers();
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
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/retailers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.retailers);
      }
    } catch (error) {
      console.error('Error fetching retailers:', error);
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
    if (!formData.batchId) {
      setMessage({ type: 'error', text: 'Please select a batch' });
      return false;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
      return false;
    }

    if (!formData.receiverId) {
      setMessage({ type: 'error', text: 'Please select a receiver' });
      return false;
    }

    const selectedItem = inventory.find(item => item.batchId === formData.batchId);
    if (!selectedItem) {
      setMessage({ type: 'error', text: 'Selected batch not found in inventory' });
      return false;
    }

    if (parseInt(formData.quantity) > selectedItem.quantity) {
      setMessage({ type: 'error', text: `Insufficient stock. Available: ${selectedItem.quantity}` });
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
      setMessage({ type: 'error', text: '⚠️ Please connect your wallet first!' });
      return;
    }

    // Step 2: Verify wallet matches user role
    const role = localStorage.getItem('role');
    const verification = verifyWalletForRole(role);
    if (!verification.valid) {
      setMessage({ type: 'error', text: `⚠️ ${verification.message}` });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '🔐 Requesting wallet signature...' });

    try {
      // Get batch and receiver details
      const selectedItem = getSelectedItem();
      const receiverUser = users.find(u => u.id === formData.receiverId);

      // Step 3: Create signing message
      const signingData = {
        action: 'TRANSFER_MEDICINE',
        batchId: formData.batchId,
        medicineName: selectedItem?.medicineName || 'Unknown',
        quantity: parseInt(formData.quantity),
        from: 'manufacturer', // Can be 'manufacturer' or 'retailer'
        to: receiverUser?.username || 'Unknown',
        toUserId: formData.receiverId,
        timestamp: Date.now()
      };

      const messageToSign = JSON.stringify(signingData);

      // Step 4: Request wallet signature
      let signature;
      try {
        signature = await signMessage(messageToSign);
        setMessage({ type: '', text: '✅ Signature received! Processing transfer...' });
      } catch (error) {
        setMessage({ type: 'error', text: `❌ Signature rejected: ${error.message}` });
        setSubmitting(false);
        return;
      }

      // Step 5: Submit to backend with signature
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId: formData.batchId,
          quantity: parseInt(formData.quantity),
          receiverId: formData.receiverId,
          signature: signature,
          signingMessage: messageToSign,
          signingTimestamp: signingData.timestamp
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Transfer completed successfully!' });
        setFormData({
          batchId: '',
          quantity: '',
          receiverId: ''
        });
        fetchInventory();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.message || 'Transfer failed'}` });
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedItem = () => {
    return inventory.find(item => item.batchId === formData.batchId);
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
      <h2>Transfer Medicine</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Initiate Transfer</h3>
        </div>
        <div className="card-body">
          {inventory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No inventory available for transfer.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Batch *</label>
                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a batch from your inventory</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.batchId}>
                      {item.medicineName} - Batch: {item.batchId} (Available: {item.quantity})
                    </option>
                  ))}
                </select>
                {getSelectedItem() && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <div><strong>Medicine:</strong> {getSelectedItem().medicineName}</div>
                    <div><strong>Category:</strong> {getSelectedItem().categoryName}</div>
                    <div><strong>MAL Number:</strong> {getSelectedItem().malNumber}</div>
                    <div><strong>Available Quantity:</strong> {getSelectedItem().quantity}</div>
                    <div><strong>Expiry Date:</strong> {new Date(getSelectedItem().expiryDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Transfer *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter quantity"
                  min="1"
                  max={getSelectedItem()?.quantity || 1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Receiver (Retailer) *</label>
                <select
                  name="receiverId"
                  value={formData.receiverId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a retailer</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <small style={{ color: '#e74c3c' }}>No registered retailers found. Contact admin to register retailers.</small>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? <span className="loading-spinner"></span> : 'Transfer Medicine'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Transfer Guide */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transfer Information</h3>
        </div>
        <div className="card-body">
          <p><strong>How to transfer medicine:</strong></p>
          <ol>
            <li>Select a batch from your available inventory</li>
            <li>Enter the quantity you want to transfer</li>
            <li>Select the receiver from the list of registered users</li>
            <li>Confirm the transfer</li>
          </ol>
          <p><strong>Note:</strong> Transfers are irreversible. Please verify all details before confirming.</p>
        </div>
      </div>
    </div>
  );
}
