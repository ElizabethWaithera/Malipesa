#!/bin/bash

# Hedera AI Agent Toolkit Setup and Run Script

echo "Setting up Hedera AI Agent Toolkit..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js (version 16+) first."
    echo "Visit https://nodejs.org/ to download and install Node.js."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your actual credentials if needed."
fi

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Check for command-line arguments to decide the mode
if [ "$1" == "--server" ]; then
    echo "Starting server mode..."
    npm run server
elif [ "$1" == "--cli" ]; then
    echo "Starting CLI mode..."
    npm run cli
else
    # Default to server mode
    echo "No mode specified, starting in server mode by default..."
    npm run server
fi

echo "Done!" 
