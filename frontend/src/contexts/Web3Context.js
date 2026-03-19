import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Ganache wallet addresses mapped to user roles
export const WALLET_ADDRESSES = {
  admin: '0x00F8DB8eFf135b324564aE33295513F5Dc7091cD',
  manufacturer: '0x9031CcAf04B81F76D8e8C4314A1A2dB74Ff7cA96',
  retailer: '0x996CBC8f7FF48ebF37e96451dC9020168F8dcbfd'
};

export function Web3ProviderComponent({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [correctNetwork, setCorrectNetwork] = useState(false);

  // Auto-connect on mount if wallet info is in localStorage
  useEffect(() => {
    const autoConnect = async () => {
      const savedAddress = localStorage.getItem('walletAddress');
      const savedBalance = localStorage.getItem('walletBalance');

      if (savedAddress && savedBalance && window.ethereum) {
        try {
          // Check if MetaMask is still connected to the same account
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });

          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            // Reconnect to the existing session
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(web3Provider);

            const web3Signer = web3Provider.getSigner();
            setSigner(web3Signer);

            const network = await web3Provider.getNetwork();
            setChainId(network.chainId);
            setCorrectNetwork(network.chainId === 1337 || network.chainId === 5777);

            setAccount(savedAddress);
            setBalance(savedBalance);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Auto-connect error:', error);
          // Clear invalid wallet info
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletBalance');
        }
      }
    };

    autoConnect();
  }, []);

  // Connect to MetaMask/Web3 wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask or another Web3 wallet!');
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        alert('Please connect at least one account!');
        return false;
      }

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      const web3Signer = web3Provider.getSigner();
      setSigner(web3Signer);

      // Get network info
      const network = await web3Provider.getNetwork();
      setChainId(network.chainId);

      // Check if connected to Ganache (chainId 1337 or 5777)
      const isGanache = network.chainId === 1337 || network.chainId === 5777;
      setCorrectNetwork(isGanache);

      // Get balance
      const balanceWei = await web3Signer.getBalance();
      const balanceEth = ethers.utils.formatEther(balanceWei);
      const formattedBalance = parseFloat(balanceEth).toFixed(4);
      setBalance(formattedBalance);

      // Save to localStorage for auto-reconnect
      localStorage.setItem('walletAddress', selectedAccount);
      localStorage.setItem('walletBalance', formattedBalance);

      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);
    setIsConnected(false);
    setCorrectNetwork(false);

    // Clear wallet info from localStorage
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletBalance');
  };

  // Sign a message (for approval actions)
  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message: ' + error.message);
    }
  };

  // Verify wallet matches expected address for role
  const verifyWalletForRole = (role) => {
    const expectedAddress = WALLET_ADDRESSES[role.toLowerCase()];
    if (!expectedAddress) {
      return { valid: false, message: `Unknown role: ${role}` };
    }

    if (!account) {
      return { valid: false, message: 'Wallet not connected' };
    }

    if (account.toLowerCase() !== expectedAddress.toLowerCase()) {
      return {
        valid: false,
        message: `Wrong wallet! Expected: ${expectedAddress}, Connected: ${account}`
      };
    }

    return { valid: true, message: 'Wallet verified' };
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload page on chain change
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnected,
    correctNetwork,
    connectWallet,
    disconnectWallet,
    signMessage,
    verifyWalletForRole,
    WALLET_ADDRESSES
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export default Web3Context;
