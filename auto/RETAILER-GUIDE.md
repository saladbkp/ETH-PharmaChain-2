# 🏪 Retailer Registration Guide

## 📋 Overview

Retailers can now register their own accounts in the PharmaChain system!

## 🚀 How to Register

### Method 1: Web Interface (Recommended)

1. **Go to the home page**: http://localhost:3000
2. **Click "Register"** button
3. **Fill in the registration form**:
   - Username: Choose a unique username
   - Password: Minimum 6 characters
   - Confirm Password: Re-enter your password
   - Role: Select "Retailer" (default)
4. **Click "Register"** button
5. **Redirect to login page** after successful registration

### Method 2: Direct URL

Navigate to: http://localhost:3000/register

### Method 3: API Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password",
    "role": "retailer"
  }'
```

## 🔑 After Registration

### Login

1. Go to http://localhost:3000/login
2. Enter your username and password
3. Click "Login"

### Check Inventory

After logging in, retailers can:
- View their current inventory
- Check received transfers from manufacturers
- Scan QR codes to verify medicine authenticity
- View transaction history

## 📱 Retailer Dashboard Features

- **My Inventory**: View all medicines in stock
- **Transactions**: See transfer history
- **Scan QR**: Verify medicine authenticity using QR codes
- **Transaction History**: Track all incoming transfers

## 🧪 Test Your Registration

Run the automated test:
```bash
cd auto
node test-retailer-registration.js
```

## 📝 Example Registration

**Username**: `retailer_acme_pharmacy`  
**Password**: `secure123`  
**Role**: `retailer`

## ⚠️ Important Notes

- Username must be unique (system will check)
- Password must be at least 6 characters
- After registration, you will be redirected to login page
- Default role is "retailer" but "manufacturer" is also available

## 🔧 Default Test Accounts

If you want to use existing test accounts:

- **Username**: retailer
- **Password**: retail123
- **Role**: retailer

## 🆘 Troubleshooting

**"Username already exists"**: Choose a different username  
**"All fields are required"**: Fill in all form fields  
**"Password must be at least 6 characters"**: Use a longer password  
**Login failed**: Verify your username and password are correct

---

✅ **Registration is now open for all retailers!**
