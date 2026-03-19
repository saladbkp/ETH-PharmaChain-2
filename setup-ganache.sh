#!/bin/bash

################################################################################
# PharmaChain - Ganache Environment Setup Script
################################################################################
# This script automatically extracts wallet addresses from Ganache and updates
# all hardcoded addresses in the codebase.
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_SRC="$PROJECT_ROOT/frontend/src"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 PharmaChain Ganache Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

################################################################################
# Function to print colored output
################################################################################
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

################################################################################
# Function to check if Ganache is running
################################################################################
check_ganache() {
    print_info "Checking if Ganache is running..."

    if curl -s http://127.0.0.1:7545 > /dev/null 2>&1; then
        print_success "Ganache is running on port 7545"
        return 0
    else
        print_error "Ganache is NOT running!"
        echo ""
        echo "Please start Ganache first:"
        echo "  - GUI: Open Ganache app → Click 'Quickstart'"
        echo "  - CLI: Run 'ganache-cli --port 7545'"
        echo ""
        exit 1
    fi
}

################################################################################
# Function to extract addresses from Ganache using web3.js
################################################################################
extract_addresses() {
    print_info "Extracting wallet addresses from Ganache..."

    # Create a temporary Node.js script to extract addresses
    cat > /tmp/extract_ganache_addresses.js << 'EOF'
const Web3 = require('web3');

async function extractAddresses() {
    const web3 = new Web3('http://127.0.0.1:7545');

    try {
        // Get list of accounts
        const accounts = await web3.eth.getAccounts();

        if (accounts.length < 3) {
            console.error('Ganache must have at least 3 accounts!');
            process.exit(1);
        }

        // Output first 3 accounts: Admin, Manufacturer, Retailer
        console.log(accounts[0]);  // Admin
        console.log(accounts[1]);  // Manufacturer
        console.log(accounts[2]);  // Retailer

    } catch (error) {
        console.error('Error extracting addresses:', error.message);
        process.exit(1);
    }
}

extractAddresses();
EOF

    # Check if web3 is installed
    if ! node -e "require('web3')" 2>/dev/null; then
        print_warning "Web3 not found, installing..."
        cd "$PROJECT_ROOT/frontend" && npm install web3 > /dev/null 2>&1
        print_success "Web3 installed"
    fi

    # Extract addresses
    ADDRESSES=($(node /tmp/extract_ganache_addresses.js 2>&1))

    if [ ${#ADDRESSES[@]} -ne 3 ]; then
        print_error "Failed to extract addresses from Ganache"
        exit 1
    fi

    ADMIN_ADDRESS="${ADDRESSES[0]}"
    MANUFACTURER_ADDRESS="${ADDRESSES[1]}"
    RETAILER_ADDRESS="${ADDRESSES[2]}"

    print_success "Extracted addresses from Ganache:"
    echo ""
    echo "  Admin:        $ADMIN_ADDRESS"
    echo "  Manufacturer: $MANUFACTURER_ADDRESS"
    echo "  Retailer:     $RETAILER_ADDRESS"
    echo ""

    # Clean up temp file
    rm -f /tmp/extract_ganache_addresses.js
}

################################################################################
# Function to update addresses in a file
################################################################################
update_file() {
    local file=$1
    local old_admin=$2
    local old_manufacturer=$3
    local old_retailer=$4
    local new_admin=$5
    local new_manufacturer=$6
    local new_retailer=$7

    if [ ! -f "$file" ]; then
        print_warning "File not found: $file"
        return
    fi

    # Create backup
    cp "$file" "${file}.backup"

    # Update addresses (handle both full and partial matches)
    sed -i '' "s/$old_admin/$new_admin/g" "$file"
    sed -i '' "s/$old_manufacturer/$new_manufacturer/g" "$file"
    sed -i '' "s/$old_retailer/$new_retailer/g" "$file"

    print_success "Updated: $file"
}

################################################################################
# Function to update all files with new addresses
################################################################################
update_all_files() {
    print_info "Updating all files with new wallet addresses..."
    echo ""

    # Read old addresses from Home.js to detect current values
    local old_admin=$(grep "ADMIN_ADDRESS = " "$FRONTEND_SRC/pages/Home.js" | sed 's/.*"\(0x[^"]*\)".*/\1/')
    local old_manufacturer=$(grep "admin: '0x" "$FRONTEND_SRC/contexts/Web3Context.js" | head -1 | sed "s/.*admin: '\(0x[^']*\)'.*/\1/")
    local old_retailer=$(grep "retailer: '0x" "$FRONTEND_SRC/contexts/Web3Context.js" | head -1 | sed "s/.*retailer: '\(0x[^']*\)'.*/\1/")

    print_info "Current addresses detected:"
    echo "  Admin:        $old_admin"
    echo "  Manufacturer: $old_manufacturer"
    echo "  Retailer:     $old_retailer"
    echo ""

    # Update all files
    update_file "$FRONTEND_SRC/pages/Home.js" \
        "$old_admin" "$old_manufacturer" "$old_retailer" \
        "$ADMIN_ADDRESS" "$MANUFACTURER_ADDRESS" "$RETAILER_ADDRESS"

    update_file "$FRONTEND_SRC/contexts/Web3Context.js" \
        "$old_admin" "$old_manufacturer" "$old_retailer" \
        "$ADMIN_ADDRESS" "$MANUFACTURER_ADDRESS" "$RETAILER_ADDRESS"

    update_file "$FRONTEND_SRC/pages/Login.js" \
        "$old_admin" "$old_manufacturer" "$old_retailer" \
        "$ADMIN_ADDRESS" "$MANUFACTURER_ADDRESS" "$RETAILER_ADDRESS"

    update_file "$PROJECT_ROOT/WALLET-ADDRESSES.md" \
        "$old_admin" "$old_manufacturer" "$old_retailer" \
        "$ADMIN_ADDRESS" "$MANUFACTURER_ADDRESS" "$RETAILER_ADDRESS"

    echo ""
    print_success "All files updated successfully!"
}

################################################################################
# Function to create/update config file
################################################################################
create_config() {
    print_info "Creating/updating configuration file..."

    cat > "$PROJECT_ROOT/ganache-config.json" << EOF
{
  "network": {
    "name": "Ganache Local",
    "rpcUrl": "http://127.0.0.1:7545",
    "chainId": 5777
  },
  "wallets": {
    "admin": {
      "address": "$ADMIN_ADDRESS",
      "username": "admin",
      "password": "admin123",
      "role": "admin"
    },
    "manufacturer": {
      "address": "$MANUFACTURER_ADDRESS",
      "username": "manufacturer",
      "password": "mfg123",
      "role": "manufacturer"
    },
    "retailer": {
      "address": "$RETAILER_ADDRESS",
      "username": "retailer_one",
      "password": "retail123",
      "role": "retailer"
    }
  },
  "contract": {
    "address": "0x7698e168808CF0C6FE8C9d5aCADac90aB7066DDA",
    "name": "PharmaChain"
  },
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    print_success "Configuration saved to: ganache-config.json"
}

################################################################################
# Function to display summary
################################################################################
display_summary() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "📋 New Wallet Addresses:"
    echo ""
    echo "  🔐 Admin:"
    echo "     Address: $ADMIN_ADDRESS"
    echo "     Username: admin"
    echo "     Password: admin123"
    echo ""
    echo "  🏭 Manufacturer:"
    echo "     Address: $MANUFACTURER_ADDRESS"
    echo "     Username: manufacturer"
    echo "     Password: mfg123"
    echo ""
    echo "  🏪 Retailer:"
    echo "     Address: $RETAILER_ADDRESS"
    echo "     Username: retailer_one"
    echo "     Password: retail123"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo ""
    echo "1. Import these accounts into MetaMask:"
    echo "   - Open Ganache"
    echo "   - Click the 'Key' icon next to each account"
    echo "   - Copy the private key"
    echo "   - In MetaMask: Import Account → Private Key → Paste"
    echo ""
    echo "2. Ensure MetaMask is connected to Ganache:"
    echo "   - Network Name: Ganache Local"
    echo "   - RPC URL: http://127.0.0.1:7545"
    echo "   - Chain ID: 5777"
    echo ""
    echo "3. Test the connection:"
    echo "   - Visit: http://localhost:3000/"
    echo "   - Click 'Connect MetaMask (Admin)'"
    echo "   - Should show: ✅ YES"
    echo ""
    echo "4. Login and test:"
    echo "   - Visit: http://localhost:3000/login"
    echo "   - Login with any role"
    echo "   - Dashboard will auto-connect wallet"
    echo ""
    echo -e "${BLUE}📄 Configuration saved to: ganache-config.json${NC}"
    echo ""
}

################################################################################
# Main script execution
################################################################################
main() {
    # Check Ganache
    check_ganache

    # Extract addresses
    extract_addresses

    # Update all files
    update_all_files

    # Create config
    create_config

    # Display summary
    display_summary
}

# Run main function
main
