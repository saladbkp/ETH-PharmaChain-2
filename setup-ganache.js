#!/usr/bin/env node

/**
 * PharmaChain - Ganache Environment Setup Script (Node.js Version)
 * 
 * This script automatically extracts wallet addresses from Ganache
 * and updates all hardcoded addresses in the codebase.
 */

const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

// Configuration
const PROJECT_ROOT = process.cwd();
const FRONTEND_SRC = path.join(PROJECT_ROOT, 'frontend/src');
const GANACHE_URL = 'http://127.0.0.1:7545';

// Files to update
const FILES_TO_UPDATE = [
    'frontend/src/pages/Home.js',
    'frontend/src/contexts/Web3Context.js',
    'frontend/src/pages/Login.js',
    'WALLET-ADDRESSES.md'
];

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function print(color, text) {
    console.log(`${color}${text}${colors.reset}`);
}

function printInfo(text) {
    print(colors.blue, `ℹ️  ${text}`);
}

function printSuccess(text) {
    print(colors.green, `✅ ${text}`);
}

function printWarning(text) {
    print(colors.yellow, `⚠️  ${text}`);
}

function printError(text) {
    print(colors.red, `❌ ${text}`);
}

/**
 * Check if Ganache is running
 */
async function checkGanache() {
    printInfo('Checking if Ganache is running...');
    
    const web3 = new Web3(GANACHE_URL);
    
    try {
        await web3.eth.getAccounts();
        printSuccess('Ganache is running on port 7545');
        return web3;
    } catch (error) {
        printError('Ganache is NOT running!');
        console.log('');
        console.log('Please start Ganache first:');
        console.log('  - GUI: Open Ganache app → Click "Quickstart"');
        console.log('  - CLI: Run "ganache-cli --port 7545"');
        console.log('');
        process.exit(1);
    }
}

/**
 * Extract wallet addresses from Ganache
 */
async function extractAddresses(web3) {
    printInfo('Extracting wallet addresses from Ganache...');
    
    const accounts = await web3.eth.getAccounts();
    
    if (accounts.length < 3) {
        printError('Ganache must have at least 3 accounts!');
        process.exit(1);
    }
    
    const addresses = {
        admin: accounts[0],
        manufacturer: accounts[1],
        retailer: accounts[2]
    };
    
    printSuccess('Extracted addresses from Ganache:');
    console.log('');
    console.log(`  Admin:        ${addresses.admin}`);
    console.log(`  Manufacturer: ${addresses.manufacturer}`);
    console.log(`  Retailer:     ${addresses.retailer}`);
    console.log('');
    
    return addresses;
}

/**
 * Extract current addresses from files
 */
function extractCurrentAddresses() {
    printInfo('Detecting current addresses...');
    
    const homeJs = path.join(FRONTEND_SRC, 'pages/Home.js');
    const web3Context = path.join(FRONTEND_SRC, 'contexts/Web3Context.js');
    
    let currentAddresses = {
        admin: null,
        manufacturer: null,
        retailer: null
    };
    
    // Extract from Home.js
    try {
        const homeContent = fs.readFileSync(homeJs, 'utf8');
        const match = homeContent.match(/ADMIN_ADDRESS = "(0x[^"]+)"/);
        if (match) {
            currentAddresses.admin = match[1];
        }
    } catch (error) {
        // Ignore
    }
    
    // Extract from Web3Context.js
    try {
        const contextContent = fs.readFileSync(web3Context, 'utf8');
        const adminMatch = contextContent.match(/admin: '(0x[^']+)'/);
        const manufacturerMatch = contextContent.match(/manufacturer: '(0x[^']+)'/);
        const retailerMatch = contextContent.match(/retailer: '(0x[^']+)'/);
        
        if (adminMatch) currentAddresses.admin = adminMatch[1];
        if (manufacturerMatch) currentAddresses.manufacturer = manufacturerMatch[1];
        if (retailerMatch) currentAddresses.retailer = retailerMatch[1];
    } catch (error) {
        // Ignore
    }
    
    console.log('  Current addresses detected:');
    console.log(`    Admin:        ${currentAddresses.admin || 'Not found'}`);
    console.log(`    Manufacturer: ${currentAddresses.manufacturer || 'Not found'}`);
    console.log(`    Retailer:     ${currentAddresses.retailer || 'Not found'}`);
    console.log('');
    
    return currentAddresses;
}

/**
 * Update addresses in a file
 */
function updateFile(filePath, oldAddresses, newAddresses) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
        printWarning(`File not found: ${filePath}`);
        return;
    }
    
    // Create backup
    const backupPath = `${fullPath}.backup`;
    fs.copyFileSync(fullPath, backupPath);
    
    // Read file
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace addresses
    if (oldAddresses.admin) {
        content = content.split(oldAddresses.admin).join(newAddresses.admin);
    }
    if (oldAddresses.manufacturer) {
        content = content.split(oldAddresses.manufacturer).join(newAddresses.manufacturer);
    }
    if (oldAddresses.retailer) {
        content = content.split(oldAddresses.retailer).join(newAddresses.retailer);
    }
    
    // Write file
    fs.writeFileSync(fullPath, content, 'utf8');
    
    printSuccess(`Updated: ${filePath}`);
}

/**
 * Update all files with new addresses
 */
function updateAllFiles(oldAddresses, newAddresses) {
    printInfo('Updating all files with new wallet addresses...');
    console.log('');
    
    FILES_TO_UPDATE.forEach(file => {
        updateFile(file, oldAddresses, newAddresses);
    });
    
    console.log('');
    printSuccess('All files updated successfully!');
}

/**
 * Create configuration file
 */
function createConfig(addresses) {
    printInfo('Creating/updating configuration file...');
    
    const config = {
        network: {
            name: 'Ganache Local',
            rpcUrl: 'http://127.0.0.1:7545',
            chainId: 5777
        },
        wallets: {
            admin: {
                address: addresses.admin,
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            },
            manufacturer: {
                address: addresses.manufacturer,
                username: 'manufacturer',
                password: 'mfg123',
                role: 'manufacturer'
            },
            retailer: {
                address: addresses.retailer,
                username: 'retailer_one',
                password: 'retail123',
                role: 'retailer'
            }
        },
        contract: {
            address: '0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA',
            name: 'PharmaChain'
        },
        updatedAt: new Date().toISOString()
    };
    
    const configPath = path.join(PROJECT_ROOT, 'ganache-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    printSuccess('Configuration saved to: ganache-config.json');
}

/**
 * Display summary
 */
function displaySummary(addresses) {
    console.log('');
    console.log(colors.green + '========================================' + colors.reset);
    console.log(colors.green + '✅ Setup Complete!' + colors.reset);
    console.log(colors.green + '========================================' + colors.reset);
    console.log('');
    console.log('📋 New Wallet Addresses:');
    console.log('');
    console.log(`  🔐 Admin:`);
    console.log(`     Address: ${addresses.admin}`);
    console.log(`     Username: admin`);
    console.log(`     Password: admin123`);
    console.log('');
    console.log(`  🏭 Manufacturer:`);
    console.log(`     Address: ${addresses.manufacturer}`);
    console.log(`     Username: manufacturer`);
    console.log(`     Password: mfg123`);
    console.log('');
    console.log(`  🏪 Retailer:`);
    console.log(`     Address: ${addresses.retailer}`);
    console.log(`     Username: retailer_one`);
    console.log(`     Password: retail123`);
    console.log('');
    console.log(colors.yellow + '📝 Next Steps:' + colors.reset);
    console.log('');
    console.log('1. Import these accounts into MetaMask:');
    console.log('   - Open Ganache');
    console.log('   - Click the "Key" icon next to each account');
    console.log('   - Copy the private key');
    console.log('   - In MetaMask: Import Account → Private Key → Paste');
    console.log('');
    console.log('2. Ensure MetaMask is connected to Ganache:');
    console.log('   - Network Name: Ganache Local');
    console.log('   - RPC URL: http://127.0.0.1:7545');
    console.log('   - Chain ID: 5777');
    console.log('');
    console.log('3. Test the connection:');
    console.log('   - Visit: http://localhost:3000/');
    console.log('   - Click "Connect MetaMask (Admin)"');
    console.log('   - Should show: ✅ YES');
    console.log('');
    console.log('4. Login and test:');
    console.log('   - Visit: http://localhost:3000/login');
    console.log('   - Login with any role');
    console.log('   - Dashboard will auto-connect wallet');
    console.log('');
    console.log(colors.blue + `📄 Configuration saved to: ganache-config.json` + colors.reset);
    console.log('');
}

/**
 * Main function
 */
async function main() {
    console.log(colors.blue + '========================================' + colors.reset);
    console.log(colors.blue + '🚀 PharmaChain Ganache Setup Script' + colors.reset);
    console.log(colors.blue + '========================================' + colors.reset);
    console.log('');
    
    // Check Ganache
    const web3 = await checkGanache();
    
    // Extract addresses
    const newAddresses = await extractAddresses(web3);
    
    // Extract current addresses
    const oldAddresses = extractCurrentAddresses();
    
    // Update all files
    updateAllFiles(oldAddresses, newAddresses);
    
    // Create config
    createConfig(newAddresses);
    
    // Display summary
    displaySummary(newAddresses);
}

// Run main function
main().catch(error => {
    printError(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
