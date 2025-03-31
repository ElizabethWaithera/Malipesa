#!/bin/bash

# Hedera NSE Tokenization - Automated Deployment Script
# This script automates the deployment of the application to Heroku

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Hedera NSE Tokenization - Deployment Script ===${NC}"
echo -e "${BLUE}This script will deploy the application to Heroku${NC}"
echo

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}Heroku CLI not found!${NC}"
    echo "Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
echo -e "${BLUE}Checking Heroku login...${NC}"
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${BLUE}Please log in to Heroku:${NC}"
    heroku login
fi

# App name
if [ -z "$1" ]; then
    APP_NAME="hedera-nse-tokenization"
    echo -e "${BLUE}Using default app name: $APP_NAME${NC}"
    echo -e "${BLUE}You can specify a custom name by running: $0 your-app-name${NC}"
else
    APP_NAME=$1
    echo -e "${BLUE}Using custom app name: $APP_NAME${NC}"
fi

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit for Heroku deployment"
fi

# Create Procfile if it doesn't exist
if [ ! -f "Procfile" ]; then
    echo -e "${BLUE}Creating Procfile...${NC}"
    echo "web: npm run build && npm start" > Procfile
    git add Procfile
    git commit -m "Add Procfile for Heroku deployment"
fi

# Create or update app in Heroku
echo -e "${BLUE}Checking if app already exists on Heroku...${NC}"
if heroku apps:info --app $APP_NAME &> /dev/null; then
    echo -e "${GREEN}App $APP_NAME already exists on Heroku.${NC}"
else
    echo -e "${BLUE}Creating new Heroku app: $APP_NAME${NC}"
    heroku create $APP_NAME
fi

# Set up environment variables
echo -e "${BLUE}Setting up environment variables...${NC}"
echo -e "${BLUE}Reading from .env file...${NC}"

if [ -f ".env" ]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        [[ $line =~ ^#.*$ ]] && continue
        [[ -z $line ]] && continue
        
        # Extract variable name and value
        var_name=$(echo "$line" | cut -d= -f1)
        var_value=$(echo "$line" | cut -d= -f2-)
        
        # Set Heroku config
        echo -e "${BLUE}Setting $var_name${NC}"
        heroku config:set "$var_name=$var_value" --app $APP_NAME
    done < .env
    
    echo -e "${GREEN}Environment variables set successfully!${NC}"
else
    echo -e "${RED}Warning: .env file not found!${NC}"
    echo "Setting default environment variables..."
    
    # Set minimal required variables
    heroku config:set NODE_ENV=production --app $APP_NAME
    heroku config:set HEDERA_NETWORK=testnet --app $APP_NAME
    
    echo -e "${RED}Important: You'll need to manually set Hedera account credentials:${NC}"
    echo "heroku config:set HEDERA_ACCOUNT_ID=your-account-id --app $APP_NAME"
    echo "heroku config:set HEDERA_PRIVATE_KEY=your-private-key --app $APP_NAME"
fi

# Add Node.js buildpack
echo -e "${BLUE}Setting up Node.js buildpack...${NC}"
heroku buildpacks:set heroku/nodejs --app $APP_NAME

# Deploy to Heroku
echo -e "${BLUE}Deploying to Heroku...${NC}"
git push heroku master || git push heroku main

# Open the app in browser
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${BLUE}Opening app in browser...${NC}"
heroku open --app $APP_NAME

echo
echo -e "${GREEN}======== Deployment Summary ========${NC}"
echo -e "App URL: ${BLUE}https://$APP_NAME.herokuapp.com${NC}"
echo -e "Heroku Dashboard: ${BLUE}https://dashboard.heroku.com/apps/$APP_NAME${NC}"
echo
echo -e "${BLUE}To view logs:${NC} heroku logs --tail --app $APP_NAME"
echo -e "${BLUE}To restart the app:${NC} heroku restart --app $APP_NAME"
echo
echo -e "${GREEN}Happy hacking!${NC}" 
