// Portfolio API for Hedera NSE Tokenization Platform
const express = require('express');
const router = express.Router();

// Mock portfolio data for demo purposes
const portfolios = {
  "Alice": {
    cash: 220000,
    stocks: [
      { symbol: "SCOM", name: "Safaricom PLC", shares: 300, avgPrice: 24.10, currentPrice: 25.30 },
      { symbol: "BAT", name: "British American Tobacco Kenya", shares: 75, avgPrice: 450.00, currentPrice: 475.25 },
      { symbol: "COOP", name: "Co-operative Bank of Kenya", shares: 250, avgPrice: 12.35, currentPrice: 13.20 }
    ]
  },
  "Bob": {
    cash: 1850000,
    stocks: [
      { symbol: "SCOM", name: "Safaricom PLC", shares: 5000, avgPrice: 22.80, currentPrice: 25.30 },
      { symbol: "EQTY", name: "Equity Group Holdings", shares: 3200, avgPrice: 40.15, currentPrice: 45.85 },
      { symbol: "EABL", name: "East African Breweries", shares: 1200, avgPrice: 175.50, currentPrice: 178.25 }
    ]
  },
  "Charlie": {
    cash: 3500000,
    stocks: [
      { symbol: "SCOM", name: "Safaricom PLC", shares: 12000, avgPrice: 24.30, currentPrice: 25.30 },
      { symbol: "EQTY", name: "Equity Group Holdings", shares: 8000, avgPrice: 44.20, currentPrice: 45.85 },
      { symbol: "KCB", name: "KCB Group PLC", shares: 5000, avgPrice: 35.10, currentPrice: 36.95 },
      { symbol: "BAMB", name: "Bamburi Cement PLC", shares: 2000, avgPrice: 41.30, currentPrice: 42.50 }
    ]
  },
  "Eve": {
    cash: 520000,
    stocks: [
      { symbol: "SCOM", name: "Safaricom PLC", shares: 1500, avgPrice: 25.10, currentPrice: 25.30 },
      { symbol: "BAT", name: "British American Tobacco Kenya", shares: 250, avgPrice: 465.00, currentPrice: 475.25 },
      { symbol: "KNRE", name: "Kenya Re", shares: 10000, avgPrice: 2.38, currentPrice: 2.45 }
    ]
  }
};

// Get user portfolio
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!portfolios[userId]) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  
  const portfolio = portfolios[userId];
  
  // Calculate portfolio statistics
  const totalStockValue = portfolio.stocks.reduce((sum, stock) => {
    return sum + (stock.shares * stock.currentPrice);
  }, 0);
  
  const totalValue = totalStockValue + portfolio.cash;
  
  const totalInvested = portfolio.stocks.reduce((sum, stock) => {
    return sum + (stock.shares * stock.avgPrice);
  }, 0);
  
  const totalProfit = totalStockValue - totalInvested;
  const percentChange = totalInvested ? (totalProfit / totalInvested) * 100 : 0;
  
  res.json({
    user: userId,
    portfolio: {
      ...portfolio,
      totalValue,
      totalStockValue,
      totalCash: portfolio.cash,
      totalProfit,
      percentChange: parseFloat(percentChange.toFixed(2))
    }
  });
});

// Update user portfolio
router.post('/transfer', (req, res) => {
  try {
    const { from, to, symbol, amount } = req.body;
    
    if (!portfolios[from] || !portfolios[to]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const fromPortfolio = portfolios[from];
    const toPortfolio = portfolios[to];
    
    // Find the stock in sender's portfolio
    const stockIndex = fromPortfolio.stocks.findIndex(s => s.symbol === symbol);
    if (stockIndex === -1) {
      return res.status(400).json({ error: `User does not own ${symbol} stocks` });
    }
    
    const stock = fromPortfolio.stocks[stockIndex];
    
    // Check if user has enough shares
    if (stock.shares < amount) {
      return res.status(400).json({ error: `Insufficient ${symbol} stocks. Available: ${stock.shares}` });
    }
    
    // Process transfer
    stock.shares -= amount;
    
    // Remove stock from portfolio if shares become zero
    if (stock.shares === 0) {
      fromPortfolio.stocks.splice(stockIndex, 1);
    }
    
    // Add stock to recipient's portfolio
    const recipientStock = toPortfolio.stocks.find(s => s.symbol === symbol);
    if (recipientStock) {
      recipientStock.shares += amount;
    } else {
      toPortfolio.stocks.push({
        symbol,
        name: stock.name,
        shares: amount,
        avgPrice: stock.currentPrice,
        currentPrice: stock.currentPrice
      });
    }
    
    // Generate transaction ID
    const txId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
    
    res.json({
      success: true,
      transaction: {
        txId,
        from,
        to,
        symbol,
        amount,
        value: amount * stock.currentPrice,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ 
      error: 'Transfer failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 
