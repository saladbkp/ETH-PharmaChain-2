/**
 * Mock Web3 Interactions for Development
 *
 * This file provides mock Web3 functionality for development without Ganache.
 * When blockchain integration is ready, replace these functions with actual web3.js calls.
 *
 * NOTE: All transactions are stored in localStorage for persistence during development.
 */

const STORAGE_KEY = 'mock_web3_transactions';
const WALLET_KEY = 'mock_wallet_address';

/**
 * Get or create a mock wallet address
 * @returns {string} Mock Ethereum address
 */
export const getMockWalletAddress = () => {
  let address = localStorage.getItem(WALLET_KEY);
  if (!address) {
    // Generate a random Ethereum-like address
    address = '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    localStorage.setItem(WALLET_KEY, address);
  }
  return address;
};

/**
 * Get all mock transactions from localStorage
 * @returns {Array} Array of mock transactions
 */
export const getMockTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading mock transactions:', error);
    return [];
  }
};

/**
 * Save mock transactions to localStorage
 * @param {Array} transactions - Array of transactions to save
 */
export const saveMockTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving mock transactions:', error);
  }
};

/**
 * Generate a mock transaction hash
 * @returns {string} Mock transaction hash
 */
export const generateMockTxHash = () => {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

/**
 * Mock contract instance for development
 */
export const mockContract = {
  /**
   * Register a medicine on the blockchain (mock)
   * @param {string} batchNumber - Batch identifier
   * @param {string} name - Medicine name
   * @param {Array} suppliers - List of suppliers
   * @param {string} expiryDate - Expiry date
   * @returns {Promise<Object>} Transaction result
   */
  registerMedicine: (batchNumber, name, suppliers, expiryDate) => ({
    send: async ({ from }) => {
      const tx = {
        txHash: generateMockTxHash(),
        batchNumber,
        name,
        suppliers,
        expiryDate,
        from: from || getMockWalletAddress(),
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        status: 'confirmed'
      };

      const transactions = getMockTransactions();
      transactions.push(tx);
      saveMockTransactions(transactions);

      console.log('[Mock Web3] Medicine registered:', tx);
      return { transactionHash: tx.txHash, tx };
    }
  }),

  /**
   * Approve a medicine on the blockchain (mock)
   * @param {string} batchNumber - Batch identifier
   * @returns {Promise<Object>} Transaction result
   */
  approveMedicine: (batchNumber) => ({
    send: async ({ from }) => {
      const tx = {
        txHash: generateMockTxHash(),
        action: 'approve',
        batchNumber,
        from: from || getMockWalletAddress(),
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        status: 'confirmed'
      };

      const transactions = getMockTransactions();
      transactions.push(tx);
      saveMockTransactions(transactions);

      console.log('[Mock Web3] Medicine approved:', tx);
      return { transactionHash: tx.txHash, tx };
    }
  }),

  /**
   * Transfer medicine ownership (mock)
   * @param {string} batchNumber - Batch identifier
   * @param {string} to - Recipient address
   * @param {number} quantity - Quantity to transfer
   * @returns {Promise<Object>} Transaction result
   */
  transferMedicine: (batchNumber, to, quantity) => ({
    send: async ({ from }) => {
      const tx = {
        txHash: generateMockTxHash(),
        action: 'transfer',
        batchNumber,
        from: from || getMockWalletAddress(),
        to,
        quantity,
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        status: 'confirmed'
      };

      const transactions = getMockTransactions();
      transactions.push(tx);
      saveMockTransactions(transactions);

      console.log('[Mock Web3] Medicine transferred:', tx);
      return { transactionHash: tx.txHash, tx };
    }
  }),

  /**
   * Get medicine details from blockchain (mock)
   * @param {string} batchNumber - Batch identifier
   * @returns {Promise<Object>} Medicine details
   */
  getMedicine: (batchNumber) => ({
    call: async () => {
      const transactions = getMockTransactions();
      const medicineTx = transactions.find(
        tx => tx.batchNumber === batchNumber && tx.name
      );

      if (medicineTx) {
        return {
          batchNumber: medicineTx.batchNumber,
          name: medicineTx.name,
          suppliers: medicineTx.suppliers,
          expiryDate: medicineTx.expiryDate,
          approved: transactions.some(
            tx => tx.batchNumber === batchNumber && tx.action === 'approve'
          )
        };
      }

      return null;
    }
  }),

  /**
   * Get transaction history for a batch (mock)
   * @param {string} batchNumber - Batch identifier
   * @returns {Promise<Array>} Array of transactions
   */
  getHistory: (batchNumber) => ({
    call: async () => {
      const transactions = getMockTransactions();
      return transactions.filter(tx => tx.batchNumber === batchNumber);
    }
  })
};

/**
 * Mock Web3 instance
 */
export const mockWeb3 = {
  currentProvider: {
    host: 'http://localhost:7545' // Ganache default
  },

  eth: {
    /**
     * Get mock accounts
     * @returns {Promise<Array>} Array of account addresses
     */
    getAccounts: async () => {
      const accounts = [
        getMockWalletAddress(),
        '0x1234567890123456789012345678901234567890',
        '0x0987654321098765432109876543210987654321'
      ];
      return accounts;
    },

    /**
     * Get mock balance
     * @param {string} address - Wallet address
     * @returns {Promise<string>} Balance in Wei
     */
    getBalance: async (address) => {
      // Return a mock balance (100 ETH)
      return '100000000000000000000';
    },

    /**
     * Send mock transaction
     * @param {Object} transaction - Transaction object
     * @returns {Promise<Object>} Transaction result
     */
    sendTransaction: async (transaction) => {
      const tx = {
        txHash: generateMockTxHash(),
        from: transaction.from || getMockWalletAddress(),
        to: transaction.to,
        value: transaction.value || '0',
        timestamp: Date.now(),
        blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        status: 'confirmed'
      };

      const transactions = getMockTransactions();
      transactions.push(tx);
      saveMockTransactions(transactions);

      console.log('[Mock Web3] Transaction sent:', tx);
      return tx.txHash;
    }
  },

  utils: {
    /**
     * Convert Wei to Ether
     * @param {string|number} wei - Amount in Wei
     * @returns {string} Amount in Ether
     */
    fromWei: (wei) => {
      const weiValue = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
      const etherValue = Number(weiValue) / 1e18;
      return etherValue.toFixed(4);
    },

    /**
     * Convert Ether to Wei
     * @param {string|number} ether - Amount in Ether
     * @returns {string} Amount in Wei
     */
    toWei: (ether) => {
      const etherValue = typeof ether === 'string' ? parseFloat(ether) : ether;
      return (etherValue * 1e18).toString();
    }
  }
};

/**
 * Initialize mock Web3 for development
 * @returns {Object} Mock Web3 instance with contract
 */
export const initMockWeb3 = () => {
  console.log('[Mock Web3] Initialized for development');
  console.log('[Mock Web3] Wallet address:', getMockWalletAddress());

  return {
    web3: mockWeb3,
    contract: mockContract,
    walletAddress: getMockWalletAddress()
  };
};

/**
 * Clear all mock data (useful for testing)
 */
export const clearMockData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(WALLET_KEY);
  console.log('[Mock Web3] All mock data cleared');
};

/**
 * Get mock transaction statistics
 * @returns {Object} Transaction statistics
 */
export const getMockStats = () => {
  const transactions = getMockTransactions();

  return {
    total: transactions.length,
    registrations: transactions.filter(tx => tx.name).length,
    approvals: transactions.filter(tx => tx.action === 'approve').length,
    transfers: transactions.filter(tx => tx.action === 'transfer').length,
    confirmed: transactions.filter(tx => tx.status === 'confirmed').length
  };
};

export default {
  mockContract,
  mockWeb3,
  initMockWeb3,
  getMockWalletAddress,
  getMockTransactions,
  generateMockTxHash,
  clearMockData,
  getMockStats
};
