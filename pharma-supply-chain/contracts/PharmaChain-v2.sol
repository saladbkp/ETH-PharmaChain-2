// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PharmaChain_v2 is Ownable {
    enum Role { None, Supplier, Manufacturer, Wholesaler, Retailer, Consumer }

    struct Medicine {
        string name;
        string suppliers;
        uint256 batchNumber;
        uint256 expiryDate;
        bool isAuthentic;
        bool isApproved;
        string qualityControlNotes;
    }

    struct Transaction {
        uint256 batchNumber;
        string sender;
        string receiver;
        uint256 timestamp;
    }

    mapping(address => Role) public roles;
    mapping(uint256 => Medicine) public medicines;
    Transaction[] public transactions;
    uint256[] public medicineBatchNumbers;
    mapping(uint256 => bool) public uploadedBySupplier;

    event MedicineUploaded(uint256 batchNumber, string suppliers);
    event MedicineCreated(uint256 batchNumber, string name);
    event QualityChecked(uint256 batchNumber, string notes);
    event MedicineTransferred(uint256 batchNumber, string sender, string receiver);
    event RoleAssigned(address user, Role role);

    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r || msg.sender == owner(), 
            "Access denied: incorrect role or not admin");
        _;
    }

    constructor() Ownable(msg.sender) {}

    // ✅ 管理员分配角色
    function assignRole(address user, Role role) public onlyOwner {
        roles[user] = role;
        emit RoleAssigned(user, role);
    }

    // ✅ 供应商上传药品基本信息
    function uploadMedicineData(uint256 _batchNumber, string memory _suppliers) public onlyRole(Role.Supplier) {
        require(!uploadedBySupplier[_batchNumber], "Data already uploaded");
        uploadedBySupplier[_batchNumber] = true;
        emit MedicineUploaded(_batchNumber, _suppliers);
    }

    // ✅ 制造商创建药品
    function createMedicine(
        uint256 _batchNumber,
        string memory _name,
        uint256 _expiryDate
    ) public onlyRole(Role.Manufacturer) {
        require(uploadedBySupplier[_batchNumber], "Data not uploaded by supplier");
        require(medicines[_batchNumber].batchNumber == 0, "Already created");

        medicines[_batchNumber] = Medicine({
            name: _name,
            suppliers: "Supplier Verified",
            batchNumber: _batchNumber,
            expiryDate: _expiryDate,
            isAuthentic: true,
            isApproved: true,
            qualityControlNotes: ""
        });
        medicineBatchNumbers.push(_batchNumber);
        emit MedicineCreated(_batchNumber, _name);
    }

    // ✅ 质量检查（制造商）
    function qualityCheck(uint256 _batchNumber, string memory _notes) public onlyRole(Role.Manufacturer) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        medicines[_batchNumber].qualityControlNotes = _notes;
        emit QualityChecked(_batchNumber, _notes);
    }

    // ✅ 批发商或零售商转移药品
    function transferMedicine(uint256 _batchNumber, string memory _to) public {
        Role senderRole = roles[msg.sender];
        require(
            senderRole == Role.Wholesaler || senderRole == Role.Retailer,
            "Only wholesaler or retailer can transfer"
        );
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");

        transactions.push(Transaction({
            batchNumber: _batchNumber,
            sender: roleToString(senderRole),
            receiver: _to,
            timestamp: block.timestamp
        }));

        emit MedicineTransferred(_batchNumber, roleToString(senderRole), _to);
    }

    // ✅ 消费者验证药品
    function verifyMedicine(uint256 _batchNumber) public view returns (
        string memory name,
        string memory supplier,
        uint256 batchNumber,
        uint256 expiry,
        bool isAuthentic,
        bool isApproved,
        string memory qcNotes
    ) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        Medicine memory m = medicines[_batchNumber];
        return (
            m.name,
            m.suppliers,
            m.batchNumber,
            m.expiryDate,
            m.isAuthentic,
            m.isApproved,
            m.qualityControlNotes
        );
    }

    // ✅ 获取所有药品
    function getAllMedicines() public view returns (Medicine[] memory) {
        Medicine[] memory all = new Medicine[](medicineBatchNumbers.length);
        for (uint256 i = 0; i < medicineBatchNumbers.length; i++) {
            all[i] = medicines[medicineBatchNumbers[i]];
        }
        return all;
    }

    // ✅ 获取交易记录
    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactions;
    }

    // 工具函数：角色转字符串
    function roleToString(Role r) internal pure returns (string memory) {
        if (r == Role.Supplier) return "Supplier";
        if (r == Role.Manufacturer) return "Manufacturer";
        if (r == Role.Wholesaler) return "Wholesaler";
        if (r == Role.Retailer) return "Retailer";
        if (r == Role.Consumer) return "Consumer";
        return "None";
    }
}
