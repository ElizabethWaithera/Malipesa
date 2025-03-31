// Hedera NSE Tokenization Platform - Server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const aiAdvisorRouter = require('./api/aiAdvisor');
const tokenizationRouter = require('./api/tokenization');
const portfolioRouter = require('./api/portfolio');
const marketDataRouter = require('./api/marketData');
const transferRouter = require('./api/transfer');
const hederaRoutes = require("./api/hedera");

// Import new advanced Hedera capabilities routes
const swapRouter = require('./api/swap');
const stakingRouter = require('./api/staking');
const marketplaceRouter = require('./api/marketplace');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from client directory with proper MIME types
app.use(
  express.static(path.join(__dirname, "../client"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// API Routes
app.use("/api/ai-advisor", aiAdvisorRouter);
app.use("/api/tokenization", tokenizationRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/market-data", marketDataRouter);
app.use("/api/transfer", transferRouter);
app.use("/api/hedera", hederaRoutes);

// New advanced Hedera capabilities routes
app.use("/api/swap", swapRouter);
app.use("/api/staking", stakingRouter);
app.use("/api/marketplace", marketplaceRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai_integration: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled',
    hedera_sdk_version: '2.39.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      tokenization: true,
      transfer: true,
      swap: true,
      staking: true,
      marketplace: true
    }
  });
});

// Default route serves the client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mali Pesa - NSE Tokenization Platform server running on port ${PORT}`);
  console.log(`OpenAI Integration: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`Advanced Hedera Features: Swap, Staking, Marketplace Enabled`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not found in environment variables. AI advisor will not function properly.');
  }
  
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.warn('Warning: Hedera credentials not found in environment variables. Tokenization features will not function properly.');
  }
});

module.exports = app; 
