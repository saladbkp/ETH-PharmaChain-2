# 🚀 Quick Start Guide - PharmaChain System

## One-Command Startup

### Mac/Linux Users:
```bash
./start.sh
```

### Windows Users:
```bash
start.bat
```

That's it! The script will:
1. ✅ Check and install all dependencies
2. ✅ Start the backend server on port 5000
3. ✅ Start the frontend server on port 3000
4. ✅ Display access URLs

---

## 📱 Access the Application

Once started, open your browser:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🛑 Stop the Servers

### Mac/Linux:
```bash
./stop.sh
```

Or press `Ctrl+C` in the terminal where you ran start.sh

### Windows:
Close the command windows or press `Ctrl+C` in each window

---

## 🔐 Default Test Accounts

After starting, you can register users with these roles:

**Manufacturer:**
- Email: manufacturer@test.com
- Password: password123
- Role: Manufacturer

**Admin:**
- Email: admin@test.com
- Password: password123
- Role: Admin

**Retailer:**
- Email: retailer@test.com
- Password: password123
- Role: Retailer

---

## 📋 Typical Workflow

### 1. Register and Login
- Navigate to http://localhost:3000
- Click "Login" → "Register"
- Create an account with your desired role

### 2. Manufacturer Workflow
- **Register Medicine:** Submit new medicine with PDF document
- **Wait for Approval:** Admin will review and approve
- **Create Batch:** Once approved, create production batches
- **Manage Inventory:** View your batches and stock

### 3. Admin Workflow
- **Review Medicines:** Approve/reject pending submissions
- **Review Batches:** Approve/reject batch submissions
- **Manage Categories:** Add medicine categories
- **Manage Staff:** Add system users

### 4. Retailer Workflow
- **View Inventory:** See received medicines
- **Scan QR Codes:** Verify medicine authenticity
- **View History:** Track all transactions

---

## 🛠️ Manual Startup (If Scripts Fail)

### Backend:
```bash
cd backend
npm install
node server.js
```

### Frontend (New Terminal):
```bash
cd frontend
npm install
npm start
```

---

## 🔧 Troubleshooting

**Port 5000 already in use?**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Port 3000 already in use?**
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Clear all data and start fresh:**
```bash
# Clear backend data
rm backend/models/*.json

# Clear mock web3 data
rm -rf backend/uploads/documents/*
localStorage.clear()  # In browser console
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Medicines
- `POST /api/medicines/submit` - Submit medicine for approval
- `GET /api/medicines/pending` - Get pending submissions (Admin)
- `POST /api/medicines/:id/approve` - Approve medicine (Admin)
- `POST /api/medicines/:id/reject` - Reject medicine (Admin)

### Batches
- `POST /api/batches/create` - Create new batch
- `GET /api/batches/pending` - Get pending batches (Admin)
- `POST /api/batches/:id/approve` - Approve batch (Admin)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Add category (Admin)
- `PUT /api/categories/:id` - Edit category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Inventory
- `GET /api/inventory/my-inventory` - Get user's inventory
- `POST /api/inventory/transfer` - Transfer to another user
- `GET /api/inventory/transactions` - Get transaction history

---

## 🔐 Environment Variables

Backend `.env` file (already configured):
```
PORT=5000
JWT_SECRET=mysecretkey
```

---

## 📦 Project Structure

```
ETH-PharmaChain-2-main/
├── backend/
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (QR, MAL generator)
│   ├── middleware/       # Auth middleware
│   ├── uploads/          # File uploads (auto-created)
│   └── server.js         # Backend server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS styles
│   │   └── utils/        # Utilities (mock Web3)
│   └── package.json
├── start.sh              # Mac/Linux startup script
├── start.bat             # Windows startup script
└── stop.sh               # Stop all servers
```

---

## 🎯 Key Features Implemented

✅ Medicine registration with document upload
✅ MAL number generation with checksum validation
✅ Multi-step approval workflow
✅ Batch management and tracking
✅ Inventory management
✅ Medicine transfer system
✅ Transaction history
✅ QR code generation and scanning
✅ Category management
✅ Staff management
✅ Mock Web3 integration (ready for real blockchain)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure Node.js is installed (v14 or higher)
3. Verify ports 3000 and 5000 are available
4. Check browser console for errors

---

**Ready to use!** Just run `./start.sh` (Mac/Linux) or `start.bat` (Windows) 🚀
