// API Routes for Hedera NSE Tokenization Platform
const express = require('express');
const router = express.Router();

// Import route handlers
const aiAdvisor = require('./aiAdvisor');
const tokenization = require('./tokenization');
const portfolio = require('./portfolio');
const marketData = require('./marketData');
const transfer = require('./transfer');

// Mount routes
router.use('/ai-advisor', aiAdvisor);
router.use('/tokenization', tokenization);
router.use('/portfolio', portfolio);
router.use('/market-data', marketData);
router.use('/transfer', transfer);

// Simple health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai_integration: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 
