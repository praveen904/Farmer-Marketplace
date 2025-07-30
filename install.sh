#!/bin/bash

echo "🚀 Setting up Farmer's Marketplace..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo "🔧 Creating environment file..."
cp env.example .env

echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB (if using local MongoDB)"
echo "2. Update .env file with your configuration"
echo "3. Run 'npm run dev' to start both server and client"
echo ""
echo "🌐 The application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""
echo "Happy farming! 🚜" 