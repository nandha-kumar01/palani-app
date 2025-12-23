#!/bin/bash
echo "🚀 Starting Palani Mobile App..."
echo "📱 Checking project structure..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

if [ ! -f "App.tsx" ]; then
    echo "❌ Error: App.tsx not found."
    exit 1
fi

echo "✅ Project structure looks good"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies are installed"

# Clear cache and start
echo "🧹 Clearing Expo cache..."
npx expo r -c

echo "🎯 Starting Expo development server..."
npx expo start

echo "✨ App should now be running!"
echo "📱 Open Expo Go on your phone and scan the QR code"
echo "💻 Or press 'w' to run in web browser"