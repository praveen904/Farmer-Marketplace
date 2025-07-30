const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Farmer\'s Marketplace Deployment...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'server/index.js',
  'client/package.json',
  'railway.json',
  'Procfile'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
  
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🔨 Building client...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Client built successfully');
} catch (error) {
  console.error('❌ Error building client:', error.message);
  process.exit(1);
}

console.log('\n🎉 Project is ready for deployment!');
console.log('\n📋 Next Steps:');
console.log('1. Push your code to GitHub');
console.log('2. Go to https://railway.app');
console.log('3. Create new project from GitHub repo');
console.log('4. Set environment variables:');
console.log('   - NODE_ENV = production');
console.log('   - MONGODB_URI = your_mongodb_connection_string');
console.log('   - JWT_SECRET = random_secret_string');
console.log('5. Deploy!');
console.log('\n🌐 Your app will be live at: https://your-project-name.railway.app'); 