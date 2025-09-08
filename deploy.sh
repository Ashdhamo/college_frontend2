#!/bin/bash

# College Frontend Deployment Script

echo "🚀 Starting College Frontend Deployment..."

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ Please edit .env file to configure your API endpoint"
    echo "   Current default: REACT_APP_API_URL=http://localhost:8080"
fi

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Deployment complete!"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "To serve the built application:"
echo "  npx serve -s build -l 3000"
echo ""
echo "Don't forget to:"
echo "1. Update REACT_APP_API_URL in .env to point to your backend server"
echo "2. Ensure your backend server is running and accessible"