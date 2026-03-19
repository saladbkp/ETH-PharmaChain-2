// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PharmaChain_ori is Ownable {
    struct Medicine {
        string name;
        string suppliers;
        uint256 batchNumber;
        uint256 expiryDate;
        bool isAuthentic;
        bool isApproved; // 🔹 由制造商审核后批准
        string qualityControlNotes; // 🔹 质量控制信息
    }

    struct Transaction {
        uint256 batchNumber;
        string sender; // 供应商 / 批发商
        string receiver; // 制造商 / 零售商
        uint256 timestamp;
    }

    mapping(uint256 => Medicine) public medicines;
    Transaction[] public transactions; // 🔹 记录所有交易
    // Array to store all medicine batch numbers
    uint256[] public medicineBatchNumbers;

    event MedicineRegistered(uint256 batchNumber, string name, string suppliers, uint256 expiryDate);
    event MedicineApproved(uint256 batchNumber, string suppliers);
    event QualityChecked(uint256 batchNumber, string notes);
    event MedicineTransferred(uint256 batchNumber, string sender, string receiver);

    constructor() Ownable(msg.sender) {}

    // ✅ 供应商上传药品
    function registerMedicine(
        uint256 _batchNumber,
        string memory _name,
        string memory _suppliers,
        uint256 _expiryDate
    ) public onlyOwner {
        require(medicines[_batchNumber].batchNumber == 0, "Medicine already exists");

        medicines[_batchNumber] = Medicine({
            name: _name,
            suppliers: _suppliers,
            batchNumber: _batchNumber,
            expiryDate: _expiryDate,
            isAuthentic: true,
            isApproved: false,
            qualityControlNotes: ""
        });
        medicineBatchNumbers.push(_batchNumber);
        emit MedicineRegistered(_batchNumber, _name, _suppliers, _expiryDate);
    }

    // ✅ 制造商审核药品
    function approveMedicine(uint256 _batchNumber) public onlyOwner {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        require(!medicines[_batchNumber].isApproved, "Already approved");

        medicines[_batchNumber].isApproved = true;

        emit MedicineApproved(_batchNumber, medicines[_batchNumber].suppliers);
    }

    // ✅ 质量检查
    function qualityCheck(uint256 _batchNumber, string memory _notes) public onlyOwner {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        medicines[_batchNumber].qualityControlNotes = _notes;

        emit QualityChecked(_batchNumber, _notes);
    }

    // ✅ 记录交易 (供应商 -> 制造商 / 批发商 -> 零售商)
    function transferMedicine(uint256 _batchNumber, string memory _sender, string memory _receiver) public onlyOwner {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");

        transactions.push(Transaction({
            batchNumber: _batchNumber,
            sender: _sender,
            receiver: _receiver,
            timestamp: block.timestamp
        }));

        emit MedicineTransferred(_batchNumber, _sender, _receiver);
    }

    // ✅ 查询交易记录
    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactions;
    }

    // ✅ 查询药品信息
    function verifyMedicine(uint256 _batchNumber) public view returns (string memory, string memory, uint256, uint256, bool, bool, string memory) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        Medicine memory med = medicines[_batchNumber];
        return (med.name, med.suppliers, med.batchNumber, med.expiryDate, med.isAuthentic, med.isApproved, med.qualityControlNotes);
    }

    // ✅ GET ALL MED
    // Function to fetch all medicines
    function getAllMedicines() public view returns (Medicine[] memory) {
        Medicine[] memory allMedicines = new Medicine[](medicineBatchNumbers.length);
        
        for (uint256 i = 0; i < medicineBatchNumbers.length; i++) {
            uint256 batchNumber = medicineBatchNumbers[i];
            allMedicines[i] = medicines[batchNumber];
        }
        
        return allMedicines;
    }
}
