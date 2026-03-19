# 🚀 Quick Start Guide - PharmaChain Automation Tests (English)

## 📋 Available Test Scripts

### 1. **Complete Workflow Test (English Version)**
```bash
cd auto
npm run test:en
# OR
node test-workflow-english.js
```

**Tests:**
- Admin register category
- Manufacturer register medicine (with PDF upload)
- Admin approve medicine (generates MAL number)
- Manufacturer check MAL tag
- Manufacturer create batch
- Admin approve batch ID
- Manufacturer check inventory increase
- Retailer check inventory status
- Retailer transfer and generate QR
- Manufacturer check stock deduction
- User scan QR for tracking

---

### 2. **Complete Workflow Test (Chinese Version)**
```bash
cd auto
npm test
# OR
node test-complete-workflow.js
```

---

### 3. **Simplified Test (No File Upload)**
```bash
cd auto
npm run test:simple
# OR
node simple-test.js
```

**Best for:** Quick regression testing, API validation

---

## 🎯 Recommended Test Workflow

### **Step 1: Ensure Backend is Running**
```bash
# From project root
./start.sh
```

### **Step 2: Run English Automation Test**
```bash
cd auto
npm run test:en
```

### **Step 3: Review Results**
- ✅ **Passed:** All steps executed successfully
- ❌ **Failed:** Check error messages
- 📊 **Success Rate:** Should be 100% (14/14)

---

## 📊 Test Output Example

```
================================================================================
🚀 PharmaChain Automated Test
================================================================================

[5:00:00 PM]
=== Step 1: Admin Login ===
[5:00:01 PM] ✅ Admin login successful

[5:00:01 PM]
=== Step 2: Admin Register Category ===
[5:00:02 PM] ✅ Category created successfully: TestCategory_1773827327101

[5:00:02 PM]
=== Step 3: Manufacturer Login ===
[5:00:02 PM] ✅ Manufacturer login successful

[5:00:03 PM]
=== Step 4: Manufacturer Register Medicine ===
[5:00:03 PM] ✅ Medicine registered successfully
           Medicine Name: Test Medicine_Amoxicillin
           Status: pending (awaiting admin approval)

[5:00:04 PM]
=== Step 5: Admin Approve Medicine ===
[5:00:05 PM] ✅ Medicine approved successfully
           Generated MAL Number: MAL202600001A
           Status: approved

... (all 14 steps)

================================================================================
📊 Test Results Summary
================================================================================
✅ Passed: 14/14
❌ Failed: 0/14
⏱️  Success Rate: 100.00%
================================================================================
```

---

## 🔐 Test Credentials

```
┌─────────────┬──────────────────┬─────────────────┐
│ Role        │ Username        │ Password       │
├─────────────┼──────────────────┼─────────────────┤
│ Admin       │ admin           │ admin123       │
│ Manufacturer│ manufacturer    │ mfg123          │
│ Retailer    │ retailer        │ retail123       │
└─────────────┴──────────────────┴─────────────────┘
```

---

## ⚡ Quick Commands Reference

```bash
# Install dependencies
cd auto && npm install

# Run complete test (English)
npm run test:en

# Run complete test (Chinese)
npm test

# Run simplified test
npm run test:simple

# Check backend status
curl http://localhost:5000

# Stop all servers
cd .. && ./stop.sh
```

---

## 📁 File Structure

```
/auto/
├── package.json                   # NPM configuration
├── test-workflow-english.js      # ✨ English version (MAIN)
├── test-complete-workflow.js     # Chinese version
├── simple-test.js                # Simplified version
├── run-test.sh                   # Shell script
├── README.md                      # Chinese documentation
└── README-EN.md                   # English documentation
```

---

## ✨ Key Features

### ✅ Automated File Upload
- Generates test PDF on-the-fly
- Uploads with FormData
- Cleans up temp files

### ✅ Dynamic Data Generation
- Unique category names (timestamp)
- Auto-generated batch IDs (BATCH-YYYYMMDD-XXXXX)
- Auto-generated registration numbers (REG-YYYYMMDD-XXXXX)

### ✅ Full Workflow Validation
- Medicine registration → approval → MAL generation
- Batch creation → approval → inventory update
- Transfer → stock deduction
- QR generation → scanning → tracking

### ✅ Comprehensive Reporting
- Real-time progress updates
- Color-coded output (success/error/warning)
- Test summary with statistics
- Data tracking across steps

---

## 🛠️ Troubleshooting

### "Cannot find module errors"
```bash
cd auto
npm install
```

### "Login failed"
```bash
# Recreate test users
cd backend
node create-users.js
```

### "Backend not running"
```bash
cd ..
./start.sh
```

### "Port 5000 in use"
```bash
./stop.sh
./start.sh
```

---

## 📝 Test Data Storage

All test data is stored in JSON files:
```
backend/models/
├── users.json           # Test users
├── medicines.json       # Medicine submissions
├── batches.json         # Batch records
├── categories.json      # Category data
├── inventory.json       # Inventory levels
├── transactions.json    # Transfer history
└── approvalHistory.json # Approval audit trail
```

---

## 🎯 Success Criteria

✅ **All tests pass (14/14)**
✅ **100% success rate**
✅ **MAL numbers generated correctly**
✅ **Inventory updates properly**
✅ **Transfers deduct stock**
✅ **QR codes contain valid data**

---

## 📞 Getting Help

1. **Check logs:** Review test output for specific error messages
2. **Verify server:** `curl http://localhost:5000`
3. **Check data:** `cat backend/models/users.json`
4. **Review docs:** See `README-EN.md` for detailed information

---

## 🚦 Status Indicators

- 🟢 **GREEN** = Test passed
- 🔴 **RED** = Test failed
- 🟡 **YELLOW** = Warning/Skipped
- 🔵 **BLUE** = Information

---

**Version:** 1.0.0
**Language:** English
**Status:** ✅ Ready to Run
**Date:** 2026-03-18
