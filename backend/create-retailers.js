const bcrypt = require('bcryptjs');
const { loadUsers, saveUsers } = require('./models/User');

async function createRetailers() {
  const users = loadUsers();
  
  const retailers = [
    { username: 'retailer_one', password: 'retail123' },
    { username: 'retailer_two', password: 'retail123' },
    { username: 'pharmacy_abc', password: 'retail123' }
  ];
  
  console.log('Creating retailer accounts...\n');
  
  for (const retailer of retailers) {
    // Check if user already exists
    const exists = users.find(u => u.username === retailer.username);
    
    if (exists) {
      console.log(`⚠️  User "${retailer.username}" already exists`);
    } else {
      // Hash password and create user
      const hashedPassword = await bcrypt.hash(retailer.password, 10);
      const newUser = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        username: retailer.username,
        password: hashedPassword,
        role: 'retailer'
      };
      
      users.push(newUser);
      console.log(`✅ Created user: ${retailer.username} (Password: ${retailer.password})`);
    }
  }
  
  saveUsers(users);
  console.log('\n✅ All retailer accounts created successfully!');
  console.log('\n📋 Retailer Accounts:');
  console.log('   1. retailer_one / retail123');
  console.log('   2. retailer_two / retail123');
  console.log('   3. pharmacy_abc / retail123');
}

createRetailers().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
