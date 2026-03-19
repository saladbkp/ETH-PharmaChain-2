@echo off
REM PharmaChain Quick Setup Script for Windows
REM This script helps set up Ganache and configure MetaMask

echo ==========================================
echo 🚀 PharmaChain Quick Setup
echo ==========================================
echo.

REM Check if Ganache is running
echo 📋 Step 1: Checking Ganache...
curl -s http://127.0.0.1:7545 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ganache is running on port 7545
) else (
    echo ❌ Ganache is NOT running!
    echo.
    echo Please start Ganache first:
    echo   - GUI: Open Ganache app and click 'Quickstart'
    echo   - CLI: Run 'ganache-cli --port 7545'
    echo.
    pause
    exit /b 1
)

echo.
echo 📋 Step 2: Open Network Setup Page
echo ----------------------------------------
echo Opening MetaMask network setup page in your browser...
echo.

REM Get the absolute path to the setup file
set "SETUP_FILE=%~dp0setup-ganache-network.html"

REM Convert backslashes to forward slashes for URL
set "SETUP_URL=file:///%SETUP_FILE:\=/%"

start "" "%SETUP_URL%"

echo.
echo 📋 Step 3: Follow the instructions on the page
echo ----------------------------------------
echo 1. Click 'Add Ganache Network to MetaMask'
echo 2. Import the 3 Ganache accounts into MetaMask:
echo    - Admin:       0xdd81CD832b7054e52e9c1e4b4c52b24391a7E035
echo    - Manufacturer: 0xa17c59c9df7ac32D6a4a62458aC824543c09ec4f
echo    - Retailer:    0x60b1F46843Fc5F6A5c74B3a057BB3fd83A09278e
echo.
echo 📋 To import accounts in MetaMask:
echo    1. Open Ganache
echo    2. Click on an account to see its private key
echo    3. In MetaMask: Account dropdown ^> Import Account
echo    4. Paste the private key and click Import
echo    5. Repeat for all 3 accounts
echo.

echo 📋 Step 4: Switch MetaMask to Ganache network
echo ----------------------------------------
echo In MetaMask, click the network dropdown and select 'Ganache Local'
echo.

echo 📋 Step 5: Login to PharmaChain
echo ----------------------------------------
echo 1. Open http://localhost:3000/login
echo 2. Login with your credentials
echo 3. MetaMask will automatically connect! ✅
echo.

echo ==========================================
echo ✅ Setup complete!
echo ==========================================
echo.
echo 📱 Quick Reference:
echo    - Frontend:  http://localhost:3000
echo    - Backend:   http://localhost:5000
echo    - Ganache:   http://127.0.0.1:7545
echo.
echo 💰 Wallet Addresses:
echo    - Admin:       0xdd81...E035
echo    - Manufacturer: 0xa17c...ec4f
echo    - Retailer:    0x60b1...78e
echo.

pause
