#!/bin/bash

# Navigate to root directory and remove React dependencies
cd /Users/josiah/dinner-registration-app
echo "Removing React dependencies from root directory..."
npm uninstall @headlessui/react @heroicons/react react-hook-form react-hot-toast react-router-dom

# Navigate to frontend directory and clean install
cd /Users/josiah/dinner-registration-app/frontend
echo "Cleaning frontend node_modules..."
rm -rf node_modules package-lock.json

echo "Installing frontend dependencies..."
npm install

echo "Dependencies fixed! You can now run 'npm run dev' from the frontend directory."