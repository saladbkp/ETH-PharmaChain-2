// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PharmaChain is AccessControl {
    // Define roles
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    struct Medicine {
        string name;
        string suppliers;
        uint256 batchNumber;
        uint256 expiryDate;
        bool isApproved;
        string qualityControlNotes;
    }

    struct Transaction {
        uint256 batchNumber;
        string sender;
        string receiver;
        uint256 timestamp;
    }

    mapping(uint256 => Medicine) public medicines;
    Transaction[] public transactions;
    uint256[] public medicineBatchNumbers;

    event MedicineRegistered(uint256 batchNumber, string name, string suppliers, uint256 expiryDate);
    event MedicineApproved(uint256 batchNumber, string suppliers);
    event QualityChecked(uint256 batchNumber, string notes);
    event MedicineTransferred(uint256 batchNumber, string sender, string receiver);

    // Initialize contract and assign roles
    constructor() {
        // Grant deployer the default admin role (can manage roles)
        _grantRole(ADMIN_ROLE, msg.sender);

        // Assign roles
        _grantRole(MANUFACTURER_ROLE, 0x1de0140241992A9424266CB359a45A64332795eC);
        _grantRole(ADMIN_ROLE, 0x1A2E1001A68B36ECA01258863fE3E489893c4707);
        _grantRole(RETAILER_ROLE, 0x3C4E3AEB19ea73802ce2896FFd5fFcd264992C97);

        // Make admin have all roles
        _grantRole(MANUFACTURER_ROLE, 0x1A2E1001A68B36ECA01258863fE3E489893c4707);
        _grantRole(RETAILER_ROLE, 0x1A2E1001A68B36ECA01258863fE3E489893c4707);
    }

    // Custom modifier that allows either specific role or admin
    modifier onlyRoleOrAdmin(bytes32 role) {
        require(
            hasRole(role, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "Access denied"
        );
        _;
    }

    // ✅ Manufacturer registers medicine (MANUFACTURER_ROLE or ADMIN_ROLE can call)
    function registerMedicine(
        uint256 _batchNumber,
        string memory _name,
        string memory _suppliers,
        uint256 _expiryDate
    ) public onlyRoleOrAdmin(MANUFACTURER_ROLE) {
        require(medicines[_batchNumber].batchNumber == 0, "Medicine already exists");

        medicines[_batchNumber] = Medicine({
            name: _name,
            suppliers: _suppliers,
            batchNumber: _batchNumber,
            expiryDate: _expiryDate,
            isApproved: false,
            qualityControlNotes: ""
        });
        medicineBatchNumbers.push(_batchNumber);
        emit MedicineRegistered(_batchNumber, _name, _suppliers, _expiryDate);
    }

    // ✅ Admin approves medicine (ADMIN_ROLE only)
    function approveMedicine(uint256 _batchNumber) public onlyRole(ADMIN_ROLE) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        require(!medicines[_batchNumber].isApproved, "Already approved");

        medicines[_batchNumber].isApproved = true;
        emit MedicineApproved(_batchNumber, medicines[_batchNumber].suppliers);
    }

    // ✅ Quality check (ADMIN_ROLE only)
    function qualityCheck(uint256 _batchNumber, string memory _notes) public onlyRole(ADMIN_ROLE) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        medicines[_batchNumber].qualityControlNotes = _notes;
        emit QualityChecked(_batchNumber, _notes);
    }

    // ✅ Retailer transfers medicine (RETAILER_ROLE or ADMIN_ROLE can call)
    function transferMedicine(
        uint256 _batchNumber, 
        string memory _sender, 
        string memory _receiver
    ) public onlyRoleOrAdmin(RETAILER_ROLE) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");

        transactions.push(Transaction({
            batchNumber: _batchNumber,
            sender: _sender,
            receiver: _receiver,
            timestamp: block.timestamp
        }));

        emit MedicineTransferred(_batchNumber, _sender, _receiver);
    }

    // ✅ Get transaction history
    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactions;
    }

    // ✅ Verify medicine
    function verifyMedicine(uint256 _batchNumber) public view returns (
        string memory, 
        string memory, 
        uint256, 
        uint256, 
        bool, 
        string memory
    ) {
        require(medicines[_batchNumber].batchNumber != 0, "Medicine not found");
        Medicine memory med = medicines[_batchNumber];
        return (
            med.name, 
            med.suppliers, 
            med.batchNumber, 
            med.expiryDate, 
            med.isApproved, 
            med.qualityControlNotes
        );
    }

    // ✅ Get all medicines
    function getAllMedicines() public view returns (Medicine[] memory) {
        Medicine[] memory allMedicines = new Medicine[](medicineBatchNumbers.length);
        
        for (uint256 i = 0; i < medicineBatchNumbers.length; i++) {
            uint256 batchNumber = medicineBatchNumbers[i];
            allMedicines[i] = medicines[batchNumber];
        }
        
        return allMedicines;
    }

    // Function to check if address has admin role
    function isAdmin(address _address) public view returns (bool) {
        return hasRole(ADMIN_ROLE, _address);
    }
}