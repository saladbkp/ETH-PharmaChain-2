# 🚀 PharmaChain Automated Testing System

Complete automated testing suite for the PharmaChain pharmaceutical supply chain management system.

---

## 📋 Test Coverage

### 1️⃣ Admin Module
- ✅ **Admin Login** - Authenticate as administrator
- ✅ **Register Category** - Create medicine categories
- ✅ **Approve Medicine** - Review and approve medicine submissions (generates MAL number)
- ✅ **Approve Batch** - Review and approve batch submissions (adds to inventory)

### 2️⃣ Manufacturer Module
- ✅ **Manufacturer Login** - Authenticate as manufacturer
- ✅ **Register Medicine** - Submit new medicine with:
  - Category selection (dynamic dropdown)
  - Company name
  - Registration number (auto-generated: REG-YYYYMMDD-XXXXX)
  - Contact email
  - PDF document upload (max 5MB, optional)
- ✅ **Check MAL Number** - Verify received MAL tag after approval
- ✅ **Create Batch** - Create production batch with:
  - Select approved medicine (MAL number)
  - Batch ID (auto-generated: BATCH-YYYYMMDD-XXXXX)
  - Quantity (>0)
  - Manufacture date (not future)
  - Expiry date (after manufacture date)
- ✅ **Check Inventory** - Verify stock quantity after batch approval
- ✅ **Transfer Medicine** - Transfer stock to retailer
- ✅ **Check Stock Deduction** - Verify inventory deduction after transfer

### 3️⃣ Retailer Module
- ✅ **Retailer Login** - Authenticate as retailer
- ✅ **Check Inventory** - View received stock
- ✅ **Receive Transfers** - Accept medicine transfers

### 4️⃣ QR Code Module
- ✅ **Generate QR** - Create QR code containing:
  - MAL Number
  - Batch ID
  - Medicine Name
  - Category
  - Quantity
  - Expiry Date
  - Verification Status
- ✅ **Scan QR** - Scan/upload QR for tracking and verification

---

## 🎯 Test Workflow

```
1. Admin Login
   ↓
2. Admin Creates Category
   ↓
3. Manufacturer Login
   ↓
4. Manufacturer Registers Medicine (with PDF)
   ↓
5. Admin Approves Medicine (generates MAL number)
   ↓
6. Manufacturer Checks MAL Number
   ↓
7. Manufacturer Creates Batch
   ↓
8. Admin Approves Batch
   ↓
9. Manufacturer Checks Inventory Increase
   ↓
10. Retailer Login
    ↓
11. Retailer Checks Inventory
    ↓
12. Transfer Medicine + Generate QR
    ↓
13. Manufacturer Checks Stock Deduction
    ↓
14. User Scans QR for Tracking
```

---

## 🚀 Quick Start

### Prerequisites
1. **Node.js** installed (v14 or higher)
2. **Backend server** running on port 5000
3. **Test users** created in the system

### Installation

```bash
cd auto
npm install
```

### Run Tests

```bash
# Option 1: Run complete workflow test
node test-workflow-english.js

# Option 2: Run simplified test
node simple-test.js

# Option 3: Use startup script
./run-test.sh
```

---

## 📊 Test Results

### Expected Output

```
================================================================================
🚀 PharmaChain Automated Test
================================================================================

[5:00:00 PM]
=== Step 1: Admin Login ===
[5:00:01 PM] ✅ Admin login successful

[5:00:01 PM]
=== Step 2: Admin Register Category ===
[5:00:02 PM] ✅ Category created successfully: TestCategory_1234567890

...

================================================================================
📊 Test Results Summary
================================================================================
✅ Passed: 14/14
❌ Failed: 0/14
⏱️  Success Rate: 100.00%
================================================================================

📋 Test Data Summary:
   Category ID: abc123-def4-5678-90ab-zyxwvutsrqpo
   Medicine ID: xyz789-abcd-1234-5678-mnopqrstuvw
   MAL Number: MAL202600001A
   Batch ID: batch-uuid-here
   Initial Inventory: 1000
================================================================================
```

---

## 🔐 Test Accounts

```
Admin:
  Username: admin
  Password: admin123
  Role: Administrator

Manufacturer:
  Username: manufacturer
  Password: mfg123
  Role: Manufacturer

Retailer:
  Username: retailer
  Password: retail123
  Role: Retailer
```

---

## 📁 Test Files

```
/auto/
├── package.json                    # Test dependencies
├── test-workflow-english.js       # Complete workflow test (English)
├── test-complete-workflow.js      # Complete workflow test (Chinese)
├── simple-test.js                 # Simplified test (no file upload)
├── run-test.sh                    # Startup script
├── README.md                      # Documentation (Chinese)
└── README-EN.md                   # Documentation (English)
```

---

## 🔍 Validation Points

Each test step validates:

### HTTP Status Codes
- ✅ 200 OK - Successful GET requests
- ✅ 201 Created - Successful POST requests
- ✅ 401 Unauthorized - Authentication failures

### Business Logic
- ✅ MAL number format: `MAL + YYYY + 5 digits + checksum`
- ✅ Batch ID uniqueness
- ✅ Quantity constraints (> 0)
- ✅ Date validation (manufacture < expiry)
- ✅ Inventory consistency (transfers deduct correctly)

### Data Persistence
- ✅ Medicine submissions saved
- ✅ Batch records created
- ✅ Inventory updates
- ✅ Transaction history
- ✅ Approval history

---

## 🛠️ Configuration

### Environment Variables

```bash
# Backend .env file
PORT=5000
JWT_SECRET=mysecretkey
```

### API Endpoints

```
POST   /api/auth/login
POST   /api/categories
GET    /api/categories
POST   /api/medicines/submit
GET    /api/medicines/pending
POST   /api/medicines/:id/approve
GET    /api/medicines/approved
GET    /api/medicines/my-submissions
POST   /api/batches/create
GET    /api/batches/pending
POST   /api/batches/:id/approve
GET    /api/inventory/my-inventory
POST   /api/inventory/transfer
GET    /api/inventory/transactions
```

---

## 📝 Test Data Format

### Category
```json
{
  "id": "uuid",
  "name": "TestCategory",
  "createdAt": 1234567890,
  "createdBy": "user-id"
}
```

### Medicine
```json
{
  "id": "uuid",
  "medicineName": "Test Medicine",
  "category": "category-id",
  "companyName": "Test Company",
  "registrationNumber": "REG-12345",
  "contactEmail": "test@test.com",
  "approvalDocument": "file.pdf",
  "status": "approved",
  "malNumber": "MAL202600001A"
}
```

### Batch
```json
{
  "id": "uuid",
  "medicineId": "medicine-uuid",
  "malNumber": "MAL202600001A",
  "batchId": "BATCH-12345",
  "quantity": 1000,
  "manufactureDate": "2024-01-01",
  "expiryDate": "2026-01-01",
  "status": "approved"
}
```

---

## ⚠️ Troubleshooting

### Issue: "Login failed"
**Solution:**
```bash
# Recreate test users
cd backend
node create-users.js
```

### Issue: "Backend not running"
**Solution:**
```bash
# Start backend server
cd ..
./start.sh
```

### Issue: "Port 5000 in use"
**Solution:**
```bash
# Kill process on port 5000
./stop.sh
./start.sh
```

### Issue: "Cannot find module 'form-data'"
**Solution:**
```bash
cd auto
npm install
```

---

## 📈 Success Criteria

Test is considered successful when:

- ✅ All 3 user types can login
- ✅ Admin can create categories
- ✅ Manufacturer can register medicines with PDF
- ✅ Admin can approve medicines (MAL generated)
- ✅ Manufacturer can create batches
- ✅ Admin can approve batches
- ✅ Inventory increases after batch approval
- ✅ Transfers deduct inventory correctly
- ✅ QR codes contain all required information
- ✅ Success rate: 100%

---

## 🔄 Continuous Integration

For CI/CD integration:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Check exit code
if [ $? -eq 0 ]; then
  echo "All tests passed"
else
  echo "Some tests failed"
  exit 1
fi
```

---

## 📞 Support

For issues or questions:
1. Check backend logs: `cd backend && tail -f server.log`
2. Review test output for error messages
3. Verify data files in `backend/models/`
4. Check server status: `curl http://localhost:5000`

---

## 📄 License

ISC

---

**Created:** 2026-03-18
**Version:** 1.0.0
**Status:** ✅ Production Ready
