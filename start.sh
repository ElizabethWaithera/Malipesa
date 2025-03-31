#!/bin/bash

# Define terminal colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

echo -e "${GREEN}=== Hedera NSE Tokenization Platform with OpenAI Integration ===${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "Please install Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi

# Check node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_VERSION_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ "$NODE_VERSION_MAJOR" -lt 16 ]; then
    echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION detected.${NC}"
    echo -e "This application works best with Node.js v16 or higher."
    echo -e "Continue anyway? (y/n)"
    read answer
    if [ "$answer" != "y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Node.js v$NODE_VERSION detected${NC}"

# Check for .env file and create if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from example${NC}"
        echo -e "${YELLOW}Please update the .env file with your API keys and Hedera credentials${NC}"
    else
        echo -e "${RED}Error: No .env.example file found.${NC}"
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install dependencies.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check for OpenAI API key
if grep -q "OPENAI_API_KEY=your_openai_key_here" .env || grep -q "OPENAI_API_KEY=" .env; then
    echo -e "${YELLOW}Warning: OpenAI API key not set in .env file.${NC}"
    echo "The AI advisor functionality will not work properly."
    echo "You can add your key later by editing the .env file."
    echo "OPENAI_API_KEY=your_key_here"
    echo ""
    # Continue without prompting
fi

# Check Hedera credentials
if grep -q "HEDERA_ACCOUNT_ID=0.0.48738123" .env || grep -q "HEDERA_PRIVATE_KEY=302e020100300506032b657004220420abcdef" .env; then
  echo -e "${YELLOW}Note: You are using demo Hedera credentials.${NC}"
  echo "For production use, update your Hedera account ID and private key in the .env file."
  echo ""
  # Continue without prompting
fi

# Check if port 3000 is already in use
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
  echo -e "${YELLOW}Port $PORT is already in use. Using port 3001 instead.${NC}"
  PORT=3001
  # Update .env file with new port
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/PORT=.*/PORT=$PORT/" .env
  else
    # Linux and other systems
    sed -i "s/PORT=.*/PORT=$PORT/" .env
  fi
fi

echo -e "${BLUE}==========================================================${NC}"
echo -e "${GREEN}Starting Hedera NSE Tokenization Platform...${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Start the development server
echo -e "${GREEN}=== Starting Hedera NSE Tokenization Platform ===${NC}"
echo -e "Server will be available at ${CYAN}http://localhost:$PORT${NC}"
echo "Press Ctrl+C to stop the server"
echo ""

# Start in development mode
PORT=$PORT npx nodemon server/server.js 
