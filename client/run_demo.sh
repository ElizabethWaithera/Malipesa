#!/bin/bash

# Hedera NSE Tokenization - Demo Runner Script
# This script starts both the backend server and frontend for the hackathon demo

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Hedera NSE Tokenization - Hackathon Demo Runner ===${NC}"
echo -e "${BLUE}This script will start the complete demo environment${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found!${NC}"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}Error: index.html not found!${NC}"
    echo "Please run this script from the client directory."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "../src" ]; then
    echo -e "${RED}Error: Backend directory not found!${NC}"
    echo "This script expects the backend code to be in ../src"
    exit 1
fi

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found in the project root!${NC}"
    echo "Creating a sample .env file with testnet configuration..."
    
    cat > "../.env" << EOL
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.12345
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# NSE Data
NSE_API_KEY=demo_key
NSE_DATA_SOURCE=synthetic

# AI Settings
OPENAI_API_KEY=your-openai-key
AI_MODEL=gpt-3.5-turbo

# Server Config
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hedera-nse
EOL
    
    echo -e "${YELLOW}Please update the .env file with your actual Hedera credentials before deploying to production.${NC}"
fi

# Create simple HTTP server for frontend
echo -e "${BLUE}Starting HTTP server for frontend...${NC}"

# Determine available ports
FRONTEND_PORT=8080
BACKEND_PORT=3000

# Check if ports are available
while netstat -tuln | grep LISTEN | grep ":$FRONTEND_PORT " > /dev/null; do
    FRONTEND_PORT=$((FRONTEND_PORT+1))
done

# Function to kill processes on exit
function cleanup {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}Demo environment stopped.${NC}"
    exit 0
}

# Set up trap for clean exit
trap cleanup SIGINT SIGTERM

# Start the backend server
echo -e "${BLUE}Starting backend server on port $BACKEND_PORT...${NC}"
cd ..
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install &> /dev/null
echo -e "${BLUE}Running backend server...${NC}"
npm run server &
BACKEND_PID=$!

# Install local http-server package if needed
cd client
echo -e "${YELLOW}Installing http-server locally if needed...${NC}"
npm install http-server --no-save &> /dev/null

# Start the frontend
echo -e "${BLUE}Starting frontend server on port $FRONTEND_PORT...${NC}"
npx http-server -p $FRONTEND_PORT . &
FRONTEND_PID=$!

# Wait for servers to start
sleep 3

# Open browser
echo -e "${GREEN}Demo environment started successfully!${NC}"
echo -e "${BLUE}Frontend URL: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}Backend API: ${GREEN}http://localhost:$BACKEND_PORT/api${NC}"
echo
echo -e "${YELLOW}Available demo accounts:${NC}"
echo -e "- Alice (Retail Investor): Account ID 0.0.12346"
echo -e "- Bob (Institutional Investor): Account ID 0.0.73921"
echo -e "- Charlie (Foreign Investor): Account ID 0.0.54892"
echo -e "- Eve (Market Maker): Account ID 0.0.38475"
echo
echo -e "${BLUE}Press Ctrl+C to stop the demo${NC}"

# Try to open browser
if command -v open &> /dev/null; then
    open "http://localhost:$FRONTEND_PORT"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$FRONTEND_PORT"
elif command -v start &> /dev/null; then
    start "http://localhost:$FRONTEND_PORT"
fi

# Keep script running until Ctrl+C
while true; do
    sleep 1
done 
