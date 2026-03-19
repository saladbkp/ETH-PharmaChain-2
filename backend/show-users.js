const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'models', 'users.json');

if (fs.existsSync(usersFile)) {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 PHARMACHAIN USER ACCOUNTS');
  console.log('='.repeat(80));
  
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.role.toUpperCase()}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Status: Active`);
    console.log(`   Password: [Encrypted]`);
  });
  
  // Count by role
  const adminCount = users.filter(u => u.role === 'admin').length;
  const manufacturerCount = users.filter(u => u.role === 'manufacturer').length;
  const retailerCount = users.filter(u => u.role === 'retailer').length;
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Users: ${users.length}`);
  console.log(`Admins: ${adminCount}`);
  console.log(`Manufacturers: ${manufacturerCount}`);
  console.log(`Retailers: ${retailerCount}`);
  console.log('='.repeat(80) + '\n');
} else {
  console.log('❌ Users file not found!');
}
