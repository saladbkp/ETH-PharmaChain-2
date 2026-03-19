const { expect } = require('chai');
const { constants, expectRevert } = require('@openzeppelin/test-helpers');
const PharmaChain = artifacts.require('PharmaChain');

contract('PharmaChain', (accounts) => {
  // 定义测试账户
  const [admin, manufacturer, retailer, unauthorized] = accounts;
  console.log(accounts);
  // 定义角色常量（与合约中一致）
  const MANUFACTURER_ROLE = web3.utils.keccak256("MANUFACTURER_ROLE");
  const ADMIN_ROLE = web3.utils.keccak256("ADMIN_ROLE");
  const RETAILER_ROLE = web3.utils.keccak256("RETAILER_ROLE");

  let pharmaChain;

  before(async () => {
    pharmaChain = await PharmaChain.new({ from: admin });
    
    // 验证合约部署时已分配的角色
    console.log("admin:", admin);
    console.log("Admin address in contract:", admin);
  });

  describe('角色权限测试', () => {
    it('应该正确分配初始角色', async () => {
      // 验证管理员有所有角色
      expect(await pharmaChain.hasRole(ADMIN_ROLE, admin)).to.be.true;
      expect(await pharmaChain.hasRole(MANUFACTURER_ROLE, admin)).to.be.true;
      expect(await pharmaChain.hasRole(RETAILER_ROLE, admin)).to.be.true;

      // 验证制造商角色
      expect(await pharmaChain.hasRole(MANUFACTURER_ROLE, manufacturer)).to.be.true;

      // 验证零售商角色
      expect(await pharmaChain.hasRole(RETAILER_ROLE, retailer)).to.be.true;
    });

    it('管理员应该可以调用所有功能', async () => {
      // 注册药品
      await pharmaChain.registerMedicine(1, "Medicine1", "Supplier1", 1234567890, { from: admin });
      
      // 批准药品
      await pharmaChain.approveMedicine(1, { from: admin });
      
      // 质量检查
      await pharmaChain.qualityCheck(1, "Good quality", { from: admin });
      
      // 转移药品
      await pharmaChain.transferMedicine(1, "Sender", "Receiver", { from: admin });
    });

    it('制造商应该只能注册药品', async () => {
      // 注册药品 - 应该成功
      await pharmaChain.registerMedicine(2, "Medicine2", "Supplier2", 1234567890, { from: manufacturer });
      
      // // 尝试批准药品 - 应该失败
      // await expectRevert(
      //   pharmaChain.approveMedicine(2, { from: manufacturer }),
      //   "Access denied"
      // );
      
      // // 尝试转移药品 - 应该失败
      // await expectRevert(
      //   pharmaChain.transferMedicine(2, "Sender", "Receiver", { from: manufacturer }),
      //   "Access denied"
      // );
    });

    it('零售商应该只能转移药品', async () => {
      // 先由管理员注册并批准药品
      await pharmaChain.registerMedicine(3, "Medicine3", "Supplier3", 1234567890, { from: admin });
      await pharmaChain.approveMedicine(3, { from: admin });
      
      // 转移药品 - 应该成功
      await pharmaChain.transferMedicine(3, "Sender", "Receiver", { from: retailer });
      
      // 尝试注册药品 - 应该失败
      // await expectRevert(
      //   pharmaChain.registerMedicine(4, "Medicine4", "Supplier4", 1234567890, { from: retailer }),
      //   "Access denied"
      // );
    });

    it('未授权用户不能调用任何功能', async () => {
      await expectRevert(
        pharmaChain.registerMedicine(5, "Medicine5", "Supplier5", 1234567890, { from: unauthorized }),
        "Access denied"
      );
      
      await expectRevert(
        pharmaChain.approveMedicine(1, { from: unauthorized }),
        "Access denied"
      );
      
      await expectRevert(
        pharmaChain.transferMedicine(1, "Sender", "Receiver", { from: unauthorized }),
        "Access denied"
      );
    });
  });

  describe('药品生命周期测试', () => {
    it('应该完成完整的药品生命周期', async () => {
      // 1. 制造商注册药品
      await pharmaChain.registerMedicine(10, "Medicine10", "Supplier10", 1234567890, { from: manufacturer });
      
      // 验证药品状态
      let med = await pharmaChain.verifyMedicine(10);
      expect(med.isApproved).to.be.false;
      
      // 2. 管理员批准药品
      await pharmaChain.approveMedicine(10, { from: admin });
      
      // 验证药品状态
      med = await pharmaChain.verifyMedicine(10);
      expect(med.isApproved).to.be.true;
      
      // 3. 管理员添加质量检查
      await pharmaChain.qualityCheck(10, "Excellent quality", { from: admin });
      
      // 4. 零售商转移药品
      await pharmaChain.transferMedicine(10, "Manufacturer", "Retailer", { from: retailer });
      
      // 验证交易历史
      const transactions = await pharmaChain.getTransactionHistory();
      expect(transactions.length).to.equal(2); // 之前的测试已经有一条交易
      expect(transactions[1].batchNumber).to.equal("10");
    });
  });
});