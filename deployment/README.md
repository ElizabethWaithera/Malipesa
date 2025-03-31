# Hedera NSE Tokenization - Hackathon Deployment Guide

This guide covers how to deploy the Hedera AI Agent Toolkit for a hackathon demonstration.

## Cloud Deployment Options

### Option 1: Heroku (Simplest)

1. Create a Heroku account and install the Heroku CLI
2. In the project root, initialize a git repository if not already done:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create a Heroku app:
   ```
   heroku create hedera-nse-tokenization
   ```
4. Add a Procfile in the project root:
   ```
   web: npm run build && npm start
   ```
5. Set up environment variables:
   ```
   heroku config:set HEDERA_ACCOUNT_ID=your-account-id
   heroku config:set HEDERA_PRIVATE_KEY=your-private-key
   heroku config:set HEDERA_OPERATOR_ID=your-account-id
   heroku config:set HEDERA_OPERATOR_KEY=your-private-key
   heroku config:set NODE_ENV=production
   ```
6. Deploy:
   ```
   git push heroku main
   ```

### Option 2: AWS Elastic Beanstalk

1. Install the AWS CLI and EB CLI
2. Initialize EB application:
   ```
   eb init -p node.js hedera-nse-tokenization
   ```
3. Create environment variables in a file named `.ebextensions/env.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:application:environment:
       HEDERA_ACCOUNT_ID: your-account-id
       HEDERA_PRIVATE_KEY: your-private-key
       HEDERA_OPERATOR_ID: your-account-id
       HEDERA_OPERATOR_KEY: your-private-key
       NODE_ENV: production
   ```
4. Create and deploy:
   ```
   eb create hedera-nse-production
   ```

### Option 3: Digital Ocean App Platform

1. Create a Digital Ocean account
2. Create a new App from the Digital Ocean dashboard
3. Connect to your GitHub repository
4. Configure environment variables in the dashboard
5. Deploy the application

## Creating a Web UI for the Hackathon

For the best hackathon presentation, add a simple React frontend:

1. Create a `client` directory with a React app using Create React App
2. Build a UI with:
   - Login panel
   - Stock visualization dashboard
   - Token transfer interface
   - Analytics visualizations

## Demonstration Script

For your hackathon demo, follow this script to showcase the system's capabilities:

1. **Introduction** (1 minute)
   - Explain the problem: Traditional stock markets lack 24/7 trading, fractional ownership, and programmability
   - Introduce your solution: Hedera-powered tokenization with AI insights

2. **Architecture Overview** (1 minute)
   - Show the system architecture diagram
   - Explain the agent-based design

3. **Live Demo** (5-7 minutes)
   - Show stock data visualizations
   - Demonstrate natural language token transfers
   - Showcase AI-powered insights and recommendations
   - Execute a cross-border token transfer (simulated)

4. **Technical Deep Dive** (2-3 minutes)
   - Explain Hedera integration
   - Highlight the natural language processing capabilities
   - Discuss the synthetic data generation

5. **Business Impact** (1-2 minutes)
   - Explain how this could transform NSE by:
     - Enabling global access to Indian markets
     - Providing 24/7 trading
     - Reducing settlement times from T+2 to near-instant
     - Enabling fractional ownership

6. **Q&A** (remainder of time)

## Enhancing Your Demo

### Create Demo Accounts

Pre-create several demo accounts with tokens already allocated to make the demo smoother:

1. Alice: Retail Investor
2. Bob: Institutional Investor
3. Charlie: Foreign Investor
4. Eve: Market Maker

### Prepare Demo Scenarios

1. **Market Overview**: Show analytics dashboard highlighting trends
2. **Token Transfer**: Demo natural language transfers between accounts
3. **Portfolio Management**: Show a user's token holdings and performance
4. **AI Insights**: Demonstrate how the AI recommends trades based on market data 
