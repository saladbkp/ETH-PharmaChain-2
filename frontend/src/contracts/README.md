# 📱 PharmaChain 智能合约使用指南

## 📁 合约文件位置

```
frontend/src/contracts/PharmaChain.json
```

## 🚀 快速开始

### 1. 在前端中使用合约

```javascript
import Web3 from 'web3';
import PharmaChainJSON from './contracts/PharmaChain.json';

// 初始化 Web3
const web3 = new Web3(window.ethereum);

// 部署的合约地址
const CONTRACT_ADDRESS = '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA';

// 创建合约实例
const contract = new web3.eth.Contract(
  PharmaChainJSON.abi,
  CONTRACT_ADDRESS
);

// 现在你可以调用合约函数了！
```

### 2. 合约配置

```javascript
// config.js
export const CONTRACT_CONFIG = {
  address: '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA',
  abi: require('./contracts/PharmaChain.json').abi,
  networks: {
    development: {
      chainId: 5777,  // 或 1337，取决于你的 Ganache 配置
      url: 'http://127.0.0.1:7545'
    }
  }
};
```

## 🔑 主要合约函数

### 管理员函数（Admin only）

#### 注册药品
```javascript
async function registerMedicine(medicineName, categoryName, malNumber) {
  const receipt = await contract.methods
    .registerMedicine(medicineName, categoryName, malNumber)
    .send({ from: '0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035' });
  return receipt;
}
```

#### 批准药品
```javascript
async function approveMedicine(medicineId) {
  const receipt = await contract.methods
    .approveMedicine(medicineId)
    .send({ from: '0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035' });
  return receipt;
}
```

#### 创建批次
```javascript
async function createBatch(medicineId, batchId, quantity, manufactureDate, expiryDate) {
  const receipt = await contract.methods
    .createBatch(medicineId, batchId, quantity, manufactureDate, expiryDate)
    .send({ from: '0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035' });
  return receipt;
}
```

### 制造商函数（Manufacturer）

#### 请求批次批准
```javascript
async function requestBatchApproval(batchId) {
  const receipt = await contract.methods
    .requestBatchApproval(batchId)
    .send({ from: '0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f' });
  return receipt;
}
```

### 查询函数（Read-only）

#### 获取药品信息
```javascript
async function getMedicine(medicineId) {
  const medicine = await contract.methods
    .getMedicine(medicineId)
    .call();
  return medicine;
}
```

#### 获取批次信息
```javascript
async function getBatch(batchId) {
  const batch = await contract.methods
    .getBatch(batchId)
    .call();
  return batch;
}
```

#### 检查药品是否已批准
```javascript
async function isMedicineApproved(medicineId) {
  const approved = await contract.methods
    .isMedicineApproved(medicineId)
    .call();
  return approved;
}
```

## 📝 完整示例

### 示例 1: 连接合约并查询

```javascript
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import PharmaChainJSON from './contracts/PharmaChain.json';

function PharmaChainComponent() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    initContract();
  }, []);

  const initContract = async () => {
    // 检查 MetaMask 是否安装
    if (typeof window.ethereum !== 'undefined') {
      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);

      // 创建 Web3 实例
      const web3 = new Web3(window.ethereum);

      // 创建合约实例
      const contractAddress = '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA';
      const contractInstance = new web3.eth.Contract(
        PharmaChainJSON.abi,
        contractAddress
      );

      setContract(contractInstance);

      // 测试调用
      try {
        // 例如：获取管理员地址
        const admin = await contractInstance.methods.admin().call();
        console.log('Admin:', admin);
      } catch (error) {
        console.error('Contract call failed:', error);
      }
    }
  };

  return (
    <div>
      <h3>PharmaChain 合约连接状态</h3>
      <p>账户: {account || '未连接'}</p>
      <p>合约: {contract ? '✅ 已连接' : '❌ 未连接'}</p>
    </div>
  );
}

export default PharmaChainComponent;
```

### 示例 2: 调用写入函数（需要签名）

```javascript
import Web3 from 'web3';
import PharmaChainJSON from './contracts/PharmaChain.json';

const CONTRACT_ADDRESS = '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA';

// 注册新药品
async function registerNewMedicine() {
  if (typeof window.ethereum === 'undefined') {
    alert('请安装 MetaMask!');
    return;
  }

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(
    PharmaChainJSON.abi,
    CONTRACT_ADDRESS
  );

  try {
    // 请求账户访问
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const fromAddress = accounts[0];

    // 调用合约函数
    const receipt = await contract.methods.registerMedicine(
      'Amoxicillin 500mg',
      'Antibiotics',
      'MAL202600001A'
    ).send({
      from: fromAddress,
      gas: 300000  // 设置 gas limit
    });

    console.log('交易成功:', receipt);
    console.log('交易哈希:', receipt.transactionHash);
    console.log('区块号:', receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error('交易失败:', error);
    alert('交易失败: ' + error.message);
  }
}

// 使用
registerNewMedicine();
```

### 示例 3: 监听事件

```javascript
import Web3 from 'web3';
import PharmaChainJSON from './contracts/PharmaChain.json';

const CONTRACT_ADDRESS = '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA';

// 初始化
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(
  PharmaChainJSON.abi,
  CONTRACT_ADDRESS
);

// 监听事件
contract.events.MedicineRegistered({
  fromBlock: 'latest'
})
  .on('data', (event) => {
    console.log('新药品注册:', event.returnValues);
  })
  .on('error', console.error);

contract.events.BatchCreated({
  fromBlock: 'latest'
})
  .on('data', (event) => {
    console.log('新批次创建:', event.returnValues);
  })
  .on('error', console.error);
```

## 🔧 配置信息

```javascript
// 合约地址
export const CONTRACT_ADDRESS = '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA';

// 网络
export const NETWORK_CONFIG = {
  chainId: 5777,  // Ganache
  rpcUrl: 'http://127.0.0.1:7545',
  name: 'Ganache Local'
};

// 账户地址
export const ACCOUNTS = {
  admin: '0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035',
  manufacturer: '0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f',
  retailer: '0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e'
};
```

## 📚 相关文件

- **Truffle 编译输出**: `pharma-supply-chain/build/contracts/`
- **部署信息**: `pharma-supply-chain/DEPLOYMENT-INFO.md`
- **原始合约**: `pharma-supply-chain/contracts/PharmaChain-v4.sol`

## ⚠️ 注意事项

1. **Gas 费用**: 在 Ganache 上不需要真实的 gas，但仍需设置 gas limit
2. **网络**: 确保 MetaMask 连接到 Ganache (Chain ID: 5777 或 1337)
3. **权限**: 某些函数只有特定角色可以调用（Admin/Manufacturer/Retailer）
4. **交易确认**: 所有写入操作都需要在 MetaMask 中确认

## 🎯 快速测试

```javascript
// 在浏览器控制台中测试
import PharmaChainJSON from './contracts/PharmaChain.json';

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(
  PharmaChainJSON.abi,
  '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA'
);

// 测试查询
contract.methods.admin().call().then(console.log);
```

---

**合约文件已准备好在你的前端使用！** 🚀
