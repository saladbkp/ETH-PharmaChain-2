# Web3 Wallet Integration Guide

## 📋 Overview

PharmaChain now includes Web3 wallet integration for secure blockchain-based approvals. Admin users must connect their MetaMask wallet and sign transactions to approve medicines and batches.

## 🔑 Wallet Addresses (Ganache)

| Role | Address | Balance |
|------|---------|---------|
| **Admin** | `0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035` | 100 ETH |
| **Manufacturer** | `0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f` | 100 ETH |
| **Retailer** | `0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e` | 100 ETH |

## 🚀 Setup Instructions

### 1. Install MetaMask

1. Download MetaMask from [https://metamask.io](https://metamask.io)
2. Create a new wallet or import existing one
3. Save your seed phrase securely!

### 2. Import Ganache Accounts into MetaMask

#### For Admin:
1. Open MetaMask
2. Click on account dropdown → "Import Account"
3. Paste private key for Admin address
4. Click "Import"

#### For Manufacturer:
1. Click "Import Account" again
2. Paste private key for Manufacturer address
3. Click "Import"

#### For Retailer:
1. Click "Import Account" again
2. Paste private key for Retailer address
3. Click "Import"

### 3. Configure MetaMask for Ganache

1. Click on network dropdown (top of MetaMask)
2. Click "Add Network" → "Add a Custom Network"
3. Enter these settings:
   - **Network Name**: `Ganache Local`
   - **New RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. Click "Save"

### 4. Start Ganache

If using Ganache GUI:
1. Open Ganache
2. Click "Quickstart"
3. Verify it's running on `http://127.0.0.1:7545`

If using Ganache CLI:
```bash
ganache-cli --port 7545
```

## 📱 How to Use

### 1. Login to PharmaChain Dashboard

Navigate to [http://localhost:3000](http://localhost:3000) and login with your credentials.

### 2. Connect Wallet

1. Click the **"🔗 Connect Wallet"** button in the top-right corner
2. MetaMask will prompt for account access
3. Select the appropriate account based on your role:
   - **Admin** → Select `0xdd81...E035`
   - **Manufacturer** → Select `0xa17c...ec4f`
   - **Retailer** → Select `0x60b1...78e`

### 3. Verify Connection

After connecting, you should see:
- ✅ Your role badge (admin/manufacturer/retailer)
- ✅ Wallet balance (in ETH)
- ✅ Truncated wallet address
- ✅ "Disconnect" button

### 4. Approve/Reject Items (Admin Only)

When approving medicines or batches:

1. Navigate to "Pending Medicines" or "Pending Batches"
2. Click "Approve" or "Reject" on any item
3. MetaMask will popup with a signature request
4. Review the message and click "Sign"
5. The approval will be processed after signature verification

## 🔐 Security Features

### Wallet Verification

- ✅ **Role-based verification**: System checks if connected wallet matches expected address for your role
- ✅ **Network check**: Ensures you're connected to Ganache (Chain ID: 1337)
- ✅ **Signature verification**: Every approval requires a cryptographic signature

### Signature Messages

When you sign an approval, the message includes:
- Action type (approve/reject)
- Entity ID (medicine/batch ID)
- Timestamp (ISO 8601 format)

Example:
```
Approve medicine 123e4567-e89b-12d3-a456-426614174000 at 2026-03-19T12:34:56.789Z
```

## 🛠️ Troubleshooting

### "Please install MetaMask" Error

**Solution**: Install MetaMask browser extension and refresh the page.

### "Wrong Wallet" Error

**Solution**:
1. Click "Disconnect"
2. Switch to the correct account in MetaMask
3. Click "Connect Wallet" again
4. Select the correct account for your role

### "Please connect to Ganache" Warning

**Solution**:
1. Open MetaMask
2. Click network dropdown
3. Select "Ganache Local" (or add custom network if not present)
4. Refresh the page

### "Signature Rejected by User" Message

**Solution**: This is normal! It means you cancelled the signature request in MetaMask. Try again if you want to proceed.

### Wallet Keeps Disconnecting

**Solution**:
- Make sure Ganache is still running
- Check that MetaMask is unlocked
- Try refreshing the page

## 📋 What's Signed

### Medicine Approvals

When approving a medicine, you sign:
```javascript
`Approve medicine ${medicineId} at ${timestamp}`
```

### Batch Approvals

When approving a batch, you sign:
```javascript
`Approve batch ${batchId} at ${timestamp}`
```

### Rejections

Rejections follow the same pattern:
```javascript
`Reject medicine ${medicineId} at ${timestamp}`
`Reject batch ${batchId} at ${timestamp}`
```

## 🎯 Backend Integration

The backend receives:
```json
{
  "signature": "0x...",
  "message": "Approve medicine 123...",
  "timestamp": 1710837296789
}
```

Backend verifies:
1. Signature is valid for the wallet address
2. Message hasn't been tampered with
3. Wallet address matches the admin role
4. Signature is recent (within time window)

## 🔧 Development

### Adding Web3 to New Pages

```javascript
import { useWeb3 } from '../../contexts/Web3Context';

function MyComponent() {
  const { isConnected, verifyWalletForRole, signMessage, correctNetwork } = useWeb3();

  const handleAction = async (entityId) => {
    // Check connection
    if (!isConnected) {
      alert('Please connect your wallet!');
      return;
    }

    // Verify role
    const verification = verifyWalletForRole('admin');
    if (!verification.valid) {
      alert(verification.message);
      return;
    }

    // Sign message
    const message = `Approve entity ${entityId} at ${new Date().toISOString()}`;
    const signature = await signMessage(message);

    // Send to backend with signature
    // ...
  };
}
```

## 📝 Notes

- **Gas Fees**: No gas fees on Ganache local network
- **Testnet**: For production, use Goerli or Sepolia testnet
- **Mainnet**: NOT recommended for testing! Always use testnets or local networks.

## 🚨 Important Security Reminders

1. **NEVER** share your private keys
2. **ALWAYS** verify the network before signing
3. **CHECK** the signature message before approving
4. **USE** separate wallets for testnet and mainnet
5. **KEEP** your seed phrase offline and secure

## 📚 Resources

- [MetaMask Documentation](https://docs.metamask.io)
- [Ethers.js Documentation](https://docs.ethers.io/v5/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ganache Documentation](https://trufflesuite.com/ganache/)

---

**Last Updated**: 2026-03-19
**Version**: 1.0.0
