#!/bin/bash

# Simple Demo Runner - Frontend Only
# This script starts just the frontend UI for the hackathon demo

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Hedera NSE Tokenization - Simple Demo Runner (Frontend Only) ===${NC}"
echo -e "${BLUE}This script will start the frontend UI only${NC}"
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

# Determine available ports
FRONTEND_PORT=8080

# Check if ports are available
while netstat -tuln | grep LISTEN | grep ":$FRONTEND_PORT " > /dev/null 2>&1; do
    FRONTEND_PORT=$((FRONTEND_PORT+1))
done

# Function to kill processes on exit
function cleanup {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    echo -e "${GREEN}Demo environment stopped.${NC}"
    exit 0
}

# Set up trap for clean exit
trap cleanup SIGINT SIGTERM

# Install local http-server package if needed
echo -e "${YELLOW}Installing http-server locally if needed...${NC}"
npm install http-server --no-save &> /dev/null

# Start the frontend
echo -e "${BLUE}Starting frontend server on port $FRONTEND_PORT...${NC}"
npx http-server -p $FRONTEND_PORT . &
FRONTEND_PID=$!

# Wait for server to start
sleep 2

# Open browser
echo -e "${GREEN}Demo environment started successfully!${NC}"
echo -e "${BLUE}Frontend URL: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo
echo -e "${YELLOW}Available demo accounts:${NC}"
echo -e "- Alice (Retail Investor): Account ID 0.0.12346"
echo -e "- Bob (Institutional Investor): Account ID 0.0.73921"
echo -e "- Charlie (Foreign Investor): Account ID 0.0.54892" 
echo -e "- Eve (Market Maker): Account ID 0.0.38475"
echo
echo -e "${YELLOW}NOTE: This is a frontend-only demo. Backend functionality is simulated.${NC}"
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
