import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import './WalletConnect.css';

export default function WalletConnect() {
  const {
    account,
    balance,
    isConnected,
    correctNetwork,
    connectWallet,
    disconnectWallet
  } = useWeb3();

  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || '');
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      console.log('Wallet connected successfully');
    }
  };

  const handleDisconnect = () => {
    // Disconnect wallet and logout
    disconnectWallet();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button onClick={handleConnect} className="wallet-button connect">
          🔗 Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <div className="wallet-details">
            <span className="wallet-label">Role:</span>
            <span className="wallet-value role-badge">{userRole}</span>
            <span className="wallet-divider">|</span>
            <span className="wallet-label">Balance:</span>
            <span className="wallet-value">{balance} ETH</span>
            <span className="wallet-divider">|</span>
            <span className="wallet-label">Address:</span>
            <span className="wallet-value address">{formatAddress(account)}</span>
          </div>
          {!correctNetwork && (
            <div className="network-warning">
              ⚠️ Please connect to Ganache (Chain ID: 1337)
            </div>
          )}
          <button onClick={handleDisconnect} className="wallet-button disconnect">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
