import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWeb3, getContract,MANUFACTURER_ROLE,ADMIN_ROLE, RETAILER_ROLE } from "../components/web3";
import "../styles/Dashboard.css"; 

const Dashboard =() => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [registerBatchNumber, setRegisterBatchNumber] = useState("");
  const [checkBatchNumber, setCheckBatchNumber] = useState("");

  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [medicineList, setMedicineList] = useState([]);
  const [medicine, setMedicine] = useState(null);
  
  const [transferBatchNumber, setTransferBatchNumber] = useState("");
  const [sender, setSender] = useState(""); // e.g., Manufacturer
  const [receiver, setReceiver] = useState(""); // e.g., Retailer
  const [transactionList, setTransactionList] = useState([]);

  const [approveBatchNumber, setApproveBatchNumber] = useState("");
  const [qualityNote, setQualityNote] = useState("");

  // Register Account States
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("retailer");
  const [registerMessage, setRegisterMessage] = useState("");
  
  const QRCode = require("qrcode");
  const [showQRCode, setShowQRCode] = useState(false); // State to control QR code modal
  const [selectedTransaction, setSelectedTransaction] = useState(null); // State to hold the selected transaction
  const [qrCodeURL, setQrCodeURL] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const isAdmin = role === "admin";
  const isManufacturer = role === "manufacturer";
  const isRetailer = role === "retailer";
  
  // const targetAccount = "0x9BAA6C8DED5a1508d6Af4BE7863dE2c51FBf4472"; // The specific account you want to connect to
  // const targetAccount = "0xD81eaD14ec55Fa4c14f0ae14E5D17DeE8EFC53a5"; // The specific account you want to connect to
  let targetAccount = "0x1A2E1001A68B36ECA01258863fE3E489893c4707"; // The specific account you want to connect to

  const [roles, setRoles] = useState({
    isManufacturer: false,
    isAdmin: false,
    isRetailer: false
  });

  // connect function
  const connect = async () => {
    const web3Instance = await getWeb3();
    const contractInstance = await getContract(web3Instance);
    const accounts = await web3Instance.eth.getAccounts();
    const userAddress = accounts[0];
    setWeb3(web3Instance);
    setContract(contractInstance);

    // const isManufacturer = await contract.methods.hasRole(MANUFACTURER_ROLE, userAddress).call();
    // const isAdmin = await contract.methods.hasRole(ADMIN_ROLE, userAddress).call();
    // const isRetailer = await contract.methods.hasRole(RETAILER_ROLE, userAddress).call();

    setRoles({ isManufacturer, isAdmin, isRetailer });
    const accountToConnect = accounts.find(account => account.toLowerCase() === userAddress.toLowerCase());
    if (accountToConnect) {
        setAccount(accountToConnect);
    } else {
        alert(`Account ${targetAccount} not found in your MetaMask!`);
    }
    
    // 根据角色显示提示
    if (isAdmin) {
      alert("Logged in as ADMIN (full access)");
    } else if (isManufacturer) {
      alert("Logged in as Manufacturer");
    } else if (isRetailer) {
      alert("Logged in as Retailer");
    } else {
      alert("No roles assigned to this address");
    }
  };


  useEffect(() => {
    const init = async () => {
      try{
        if (!token) {
          navigate("/login"); // redirect if not logged in
        }
        setLoading(true);
        connect();
        fetchTransactionHistory();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      
    };

    init();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "24px" }}>
        Connecting to MetaMask...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "red", fontSize: "24px" }}>
        {error}
      </div>
    );
  }

  const registerMedicine = async () => {
    const expiryDate_time = new Date(expiryDate).getTime() / 1000;
    console.log(`Register ${medicineName} ${manufacturer} ${expiryDate_time}`)
    if (!contract) return;
    // first 
    if (!validateBatchNumber(registerBatchNumber)) {
      alert("Batch ID must be a number.");
      return;
    }
    try {
      await contract.methods
        .registerMedicine(registerBatchNumber, medicineName, manufacturer, expiryDate_time)
        .send({ from: account, gas: 200000 });
      alert("Medicine registered!");
    } catch (error) {
      console.log("Error during transaction:", error);
      if (error?.message?.includes("Medicine already exists")) {
        alert("This medicine batch number is already registered.");
        fetchMedicines();
      } else {
        alert("Transaction failed.");
      }
    }
    
  };

  const getMedicine = async () => {
     // first 
     if (!validateBatchNumber(checkBatchNumber)) {
      alert("Batch ID must be a number.");
      return;
    }

    if (!contract) {
      return;}
    try {
      const med = await contract.methods.verifyMedicine(checkBatchNumber).call();
      console.log("Raw return:", med);
      setMedicine({
        name: med[0],
        manufacturer: med[1],
        batchNumber: med[2],
        expiryDate: med[3],
        verified: med[4],
        qualityCheck: med[5],
      });
    } catch (err) {
      console.error("Error in contract call:", err);
    }
  };

  const fetchMedicines = async () => {
    if (!contract) return;
    const medicines = await contract.methods.getAllMedicines().call(); 
    console.log(medicines);
    setMedicineList(medicines);
  };

  async function transferMedicine() {
    try {
      if (!roles.isManufacturer) {
        alert("Only Manufacturer can transfer medicine.");
        return;
      }
      // first 
      if (!validateBatchNumber(transferBatchNumber)) {
        alert("Batch ID must be a number.");
        return;
      }
      // second 
      const med = await contract.methods.verifyMedicine(transferBatchNumber).call();

      const isApproved = Boolean(med[4]); // 如果你用 struct 就改成 med.isApproved

      if (!isApproved) {
        alert("❌ Please verify (approve) this medicine first.");
        return;
      }

      await contract.methods
        .transferMedicine(transferBatchNumber, sender, receiver)
        .send({ from: account, gas: 200000 });
  
      alert("Transfer successful");
      fetchTransactionHistory(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Transfer failed");
    }
  }
  
  async function fetchTransactionHistory() {
    try {
      const transactions = await contract.methods.getTransactionHistory().call();
      setTransactionList(transactions);
    } catch (err) {
      console.error("Failed to fetch transaction history", err);
    }
  }

  // Approve Medicine
  const approveMedicine = async () => {
    if (!contract || !approveBatchNumber) {
      alert("no batch number");
      return;
    }
    // first 
    if (!validateBatchNumber(approveBatchNumber)) {
      alert("Batch ID must be a number.");
      return;
    } 
    
    try {
      await contract.methods.approveMedicine(approveBatchNumber).send({ from: targetAccount });
      alert("Medicine approved successfully!");
      fetchMedicines();
    } catch (err) {
      console.error("Error approving medicine:", err);
    }
  };

  // Add Quality Note
  const addQualityNote = async () => {
    // first 
    if (!validateBatchNumber(approveBatchNumber)) {
      alert("Batch ID must be a number.");
      return;
    }
    if (!contract || !approveBatchNumber || !qualityNote){
      alert("no batch number");
      return;
    }
    try {
      console.log(approveBatchNumber,qualityNote);
      await contract.methods.qualityCheck(approveBatchNumber, qualityNote).send({ from: targetAccount });
      alert("Quality note added successfully!");
      fetchMedicines();
      // setQualityNote("");  // Clear the input field
    } catch (err) {
      console.error("Error adding quality note:", err);
    }
  };
  
  const validateBatchNumber = (value) => {
    const numberRegex = /^[0-9]+$/;
    return numberRegex.test(value);
  };

  const handleQRCodeClick = async (transaction) => {
    setSelectedTransaction(transaction); // Set the selected transaction
    setShowQRCode(true); // Show the QR code modal

    // Generate the QR code using the 'qrcode' library
    try {
      // Destructure properties from transaction
      const { batchNumber, receiver, sender, timestamp } = transaction;
    
      // Convert BigInt to string if necessary
      const batchNumberStr = batchNumber.toString();
      const timestampStr = timestamp.toString();
    
      // Create the string for QR code (template literals for readability)
      const transString = `${batchNumberStr} ${receiver} ${sender} ${timestampStr}`;
      console.log("Transaction String for QR Code:", transString);
    
      // Generate QR code as Data URL
      const url = await QRCode.toDataURL(transString);
      console.log("Generated QR Code URL:", url);
    
      // Set the QR code URL in the state
      setQrCodeURL(url);
    } catch (error) {
      // Provide more detailed error handling
      console.error("Error generating QR code:", error.message || error);
    }
    
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false); // Close the QR code modal
    setSelectedTransaction(null); // Reset the selected transaction
    setQrCodeURL(""); // Clear the QR code URL
  };

  // Disconnect function
  const disconnect = () => {
    setAccount(""); // Reset the account state to disconnect
    alert("Disconnected from account.");
  };

  
  const checkPermission = async (requiredRole) => {
    if (!contract || !account) return false;
    
    try {
      const isAdmin = await contract.methods.hasRole(ADMIN_ROLE, account).call();
      if (isAdmin) return true;
      
      return await contract.methods.hasRole(requiredRole, account).call();
    } catch (error) {
      console.error("Permission check failed:", error);
      return false;
    }
  };
  // log out 
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Register Account Function
  const handleRegisterAccount = async () => {
    try {
      if (registerPassword !== registerConfirmPassword) {
        setRegisterMessage("⚠️ Passwords do not match.");
        return;
      }
      const newUser = {
        username: registerUsername,
        password: registerPassword,
        role: registerRole
      };
  
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
  
      setRegisterMessage('✅ Account registered successfully!');
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterRole('retailer');
    } catch (error) {
      setRegisterMessage(`⚠️ Registration error: ${error.message}`);
    }
  };  
  return (
    <div className="dashboard-layout">
      {/* Left Navigation Panel */}
      <nav className={`left-panel ${isPanelCollapsed ? 'collapsed' : ''}`}>
        <h2>Navigation</h2>
        <ul>
          {/* only Manufacturer */}
          {roles.isManufacturer && (
            <li><a href="#register">Register Medicine</a></li>
          )}

          <li><a href="#check">Check Medicine</a></li>
          <li><a href="#all-medicines">All Medicines</a></li>

          {/* only Admin can Approve */}
          {roles.isAdmin && (
            <li><a href="#approve">Approve Medicine</a></li>
          )}

          {/* only Manufacturer can Transfer */}
          {roles.isManufacturer && (
            <li><a href="#transfer">Transfer Medicine</a></li>
          )}

          <li><a href="#history">Transfer History</a></li>

          {/* Retailer only */}
          {roles.isRetailer && (
            <li><a href="#received">My Received</a></li>
          )}

          {roles.isAdmin && (
            <li><a href="#register-account">Register Account</a></li>
          )}
        </ul>
      </nav>

      {/* Main Content Area */}
      <button
        className={`panel-toggle ${isPanelCollapsed ? 'collapsed' : ''}`}
        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
      >
        {isPanelCollapsed ? '→' : '←'}
      </button>
      <div className={`main-content ${isPanelCollapsed ? 'expanded' : ''}`}>
        <div className="header">
          <h1>PharmaChain - Blockchain Medicine Tracking</h1>
          <div className="account-info">
            <p>Connected Account: {account}</p>
            <p>Connected Role: <strong>{role}</strong></p>
      
            {/* Disconnect Button */}
            
            {!account && (
              <button onClick={connect} className="connect-btn">
                Connect
              </button>
            )}

            {account && (
              <button onClick={disconnect} className="disconnect-btn">
                Disconnect
              </button>
            )}

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
      {(roles.isManufacturer) && (
      <div id="register" className="register-medicine-form section">
        <h2>Register Medicine</h2>
        <input
          type="text"
          placeholder="Batch Number"
          onChange={(e) => setRegisterBatchNumber(e.target.value)}
          value={registerBatchNumber}
        />

        <input
          type="text"
          placeholder="Medicine Name"
          onChange={(e) => setMedicineName(e.target.value)}
          value={medicineName}
        />
        <input
          type="text"
          placeholder="Manufacturer"
          onChange={(e) => setManufacturer(e.target.value)}
          value={manufacturer}
        />
        <input
          type="date"
          placeholder="Expiry Date"
          onChange={(e) => setExpiryDate(e.target.value)}
          value={expiryDate}
        />
        <button className="register_check-btn" onClick={registerMedicine}>Register</button>
      </div>
      )}
      <div id="check" className="check-medicine-form section">
        <h2>Check Medicine</h2>
        <input
          type="text"
          placeholder="Enter Batch Number"
          onChange={(e) => setCheckBatchNumber(e.target.value)}
          value={checkBatchNumber}
        />
        <button className="register_check-btn" onClick={getMedicine}>Check</button>
        {medicine && (
          <div className="medicine-info">
            <h3>Medicine Info</h3>
            <p>Name: {medicine.name}</p>
            <p>Manufacturer: {medicine.manufacturer}</p>
            <p>Batch Number: {medicine.batchNumber}</p>
            <p>Expiry Date: {new Date(Number(medicine.expiryDate) * 1000).toLocaleDateString()}</p>
            <p>Verified: {medicine.verified ? "✅ Verified" : "❌ Not Verified"}</p>
            <p>Quality Check: {medicine.qualityCheck ? medicine.qualityCheck : "❌ Not Verified"}</p>
          </div>
        )}
      </div>

      <div id="all-medicines" className="medicine-board section">
        <h2>All Medicines</h2>
        <button className="refresh-btn" onClick={fetchMedicines}>Refresh Medicines</button> {/* Refresh button */}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Batch Number</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {medicineList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-history-msg">No transfer history found.</td>
                </tr>
              ) : (
              medicineList.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.suppliers}</td>
                  <td>{med.batchNumber}</td>
                  <td>{new Date(Number(med.expiryDate) * 1000).toLocaleDateString()}</td>
                  <td>{med.isApproved ? "✅ Verified" : "❌ Not Verified"}</td>
                  <td>{med.qualityControlNotes ? med.qualityControlNotes : "❌ Quality Check"}</td>
                </tr>
              )))}
          </tbody>

        </table>
      </div>
      
      {roles.isAdmin && (
      <div id="approve" className="approve-medicine-form section">
        <h2>Approve Medicine</h2>
        <input
          type="text"
          placeholder="Enter Batch Number"
          onChange={(e) => setApproveBatchNumber(e.target.value)}
          value={approveBatchNumber}
        />
        
          <button className="approve-btn" onClick={approveMedicine}>Approve Medicine</button>
          <input
            placeholder="Add quality check notes..."
            value={qualityNote}
            onChange={(e) => setQualityNote(e.target.value)}
          />
          <button className="add-quality-btn" onClick={addQualityNote}>Add Quality Note</button>
      </div>
      )}
      {roles.isManufacturer && (
      <div id="transfer" className="transfer-medicine-form section">
        <h2>Transfer Medicine</h2>
          <input
            type="text"
            placeholder="Batch Number"
            value={transferBatchNumber}
            onChange={(e) => setTransferBatchNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="Sender (e.g. Manufacturer)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
          <input
            type="text"
            placeholder="Receiver (e.g. Retailer)"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
        <button className="register_check-btn" onClick={transferMedicine}>
          Transfer Medicine
        </button>
      </div>
      )}


      <div id="history" className="transaction-history section">
        <h2 className="history-title">📜 Medicine Transfer History</h2>
        <button className="refresh-btn" onClick={fetchTransactionHistory}>Refresh Transaction</button>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactionList.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-history-msg">No transfer history found.</td>
              </tr>
            ) : (
              transactionList.map((tx, idx) => (
                <tr key={idx}>
                  <td>{tx.batchNumber}</td>
                  <td>{tx.sender}</td>
                  <td>{tx.receiver}</td>
                  <td>{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                  <td>
                  <button
                    className="qr-btn"
                    onClick={() => handleQRCodeClick(tx)}
                  >
                    Show QR Code
                  </button>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* QR Code Modal */}
        {showQRCode && selectedTransaction && (
          <div className="qr-modal">
            <div className="qr-modal-content">
              <h3>Transaction Details</h3>
              <p><strong>Batch Number:</strong> {selectedTransaction.batchNumber}</p>
              <p><strong>Manufacturer:</strong> {selectedTransaction.sender}</p>
              <p><strong>Retailer:</strong> {selectedTransaction.receiver}</p>
              <p><strong>Timestamp:</strong> {new Date(Number(selectedTransaction.timestamp) * 1000).toLocaleString()}</p>
              {/* Display the QR code */}
              <img src={qrCodeURL} alt="QR Code" />

              {/* Dismiss Button */}
              <button className="dismiss-btn" onClick={handleCloseQRCode}>
                Dismiss
              </button>
            </div>
          </div>
        )}
          </div>

        {roles.isRetailer && (
          <div id="received" className="transaction-history section">
            <h2 className="history-title">📦 My Received</h2>

            <button className="refresh-btn" onClick={fetchTransactionHistory}>
              Refresh My Received
            </button>

            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {transactionList
                  .filter((tx) =>
                    (tx.receiver || "").toLowerCase() === (role || "").toLowerCase()
                  )
                  .length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-history-msg">
                      No received medicines found.
                    </td>
                  </tr>
                ) : (
                  transactionList
                    .filter((tx) =>
                      (tx.receiver || "").toLowerCase() === (role || "").toLowerCase()
                    )
                    .map((tx, idx) => (
                      <tr key={idx}>
                        <td>{tx.batchNumber}</td>
                        <td>{tx.sender}</td>
                        <td>{tx.receiver}</td>
                        <td>{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

          {roles.isAdmin && (
        <div id="register-account" className="register-account-form section">
          <h2>👤 Register New Account</h2>
          {registerMessage && <p className="message">{registerMessage}</p>}
          <input
            type="text"
            placeholder="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            className="register_check-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="register_check-input"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            className="register_check-input"
          />
          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
            className="register_check-input"
          >
            <option value="retailer">Retailer</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            onClick={handleRegisterAccount}
            disabled={!registerUsername || !registerPassword || !registerConfirmPassword}
            className="register_check-btn"
          >
            Register Account
          </button>
        </div>
      )}
        </div>



      </div>
    </div>
  );
}

export default Dashboard;
