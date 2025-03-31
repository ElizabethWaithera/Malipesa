// Token Transfer API for Hedera NSE Tokenization Platform
const express = require('express');
const router = express.Router();

// Mock transfer history for demo purposes
let transferHistory = [
  { 
    txId: '0.0.116970-1742996186197',
    from: 'Alice',
    fromAccount: '0.0.12346',
    to: 'Bob',
    toAccount: '0.0.73921',
    symbol: 'SCOM',
    amount: 10,
    value: 2574.50,
    timestamp: '2023-12-05T10:23:12.000Z',
    status: 'SUCCESS'
  },
  { 
    txId: '0.0.465843-1742996188205',
    from: 'Alice',
    fromAccount: '0.0.12346',
    to: 'Charlie',
    toAccount: '0.0.54892',
    symbol: 'EQTY',
    amount: 5,
    value: 1715.75,
    timestamp: '2023-12-05T10:25:45.000Z',
    status: 'SUCCESS'
  },
  { 
    txId: '0.0.402587-1742996195250',
    from: 'Alice',
    fromAccount: '0.0.12346',
    to: 'Eve',
    toAccount: '0.0.38475',
    symbol: 'COOP',
    amount: 3,
    value: 629.35,
    timestamp: '2023-12-05T10:32:21.000Z',
    status: 'SUCCESS'
  },
  { 
    txId: '0.0.765432-1742909786312',
    from: 'Bob',
    fromAccount: '0.0.73921',
    to: 'Alice',
    toAccount: '0.0.12346',
    symbol: 'KCB',
    amount: 20,
    value: 3350.00,
    timestamp: '2023-12-04T16:05:32.000Z',
    status: 'SUCCESS'
  },
  { 
    txId: '0.0.987654-1742895123456',
    from: 'Eve',
    fromAccount: '0.0.38475',
    to: 'Charlie',
    toAccount: '0.0.54892',
    symbol: 'EQTY',
    amount: 15,
    value: 5147.25,
    timestamp: '2023-12-04T11:15:48.000Z',
    status: 'SUCCESS'
  }
];

// Get transfer history
router.get('/history', (req, res) => {
  const { user, limit } = req.query;
  
  let filteredHistory = [...transferHistory];
  
  // Filter by user if specified
  if (user) {
    filteredHistory = filteredHistory.filter(tx => 
      tx.from === user || tx.to === user
    );
  }
  
  // Apply limit if specified
  const resultLimit = limit ? parseInt(limit) : 50;
  filteredHistory = filteredHistory.slice(0, resultLimit);
  
  res.json({
    transfers: filteredHistory,
    count: filteredHistory.length,
    timestamp: new Date().toISOString()
  });
});

// Get transfer details
router.get('/:txId', (req, res) => {
  const { txId } = req.params;
  
  const transfer = transferHistory.find(tx => tx.txId === txId);
  
  if (!transfer) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  res.json({
    transaction: transfer,
    timestamp: new Date().toISOString()
  });
});

// Create new transfer
router.post('/', (req, res) => {
  try {
    const { from, fromAccount, to, toAccount, symbol, amount } = req.body;
    
    if (!from || !to || !symbol || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // In a real implementation, this would:
    // 1. Connect to Hedera SDK
    // 2. Execute token transfer
    // 3. Wait for consensus
    // 4. Return the transaction details
    
    // For demo, generate a transaction ID
    const txId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
    
    // Create transaction record
    const newTransfer = {
      txId,
      from,
      fromAccount: fromAccount || `0.0.${Math.floor(Math.random() * 1000000)}`,
      to,
      toAccount: toAccount || `0.0.${Math.floor(Math.random() * 1000000)}`,
      symbol,
      amount: parseInt(amount),
      value: parseFloat((amount * 25.30).toFixed(2)), // Mock price calculation
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    };
    
    // Add to history
    transferHistory.unshift(newTransfer);
    
    // Return success response
    setTimeout(() => {
      res.status(201).json({
        transaction: newTransfer,
        message: 'Transfer completed successfully',
        timestamp: new Date().toISOString()
      });
    }, 1500); // Simulate network delay
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ 
      error: 'Transfer failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Process a transfer from natural language input
router.post('/process-nl', (req, res) => {
  try {
    const { query, user } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    // Simple NLP to extract transfer details
    // In production, this would use a more sophisticated model
    const words = query.toLowerCase().split(' ');
    
    // Extract amount (first number in the query)
    let amount = 0;
    for (const word of words) {
      const num = parseInt(word);
      if (!isNaN(num)) {
        amount = num;
        break;
      }
    }
    
    // Extract token symbol (usually uppercase)
    const symbols = ['SCOM', 'EQTY', 'KCB', 'COOP', 'EABL', 'BAT', 'BAMB', 'KNRE'];
    let symbol = '';
    for (const word of words) {
      const upperWord = word.toUpperCase().replace(/[^A-Z]/g, '');
      if (symbols.includes(upperWord)) {
        symbol = upperWord;
        break;
      }
    }
    
    // Extract recipient (after "to" keyword)
    let recipient = '';
    const toIndex = words.indexOf('to');
    if (toIndex !== -1 && toIndex < words.length - 1) {
      recipient = words[toIndex + 1].charAt(0).toUpperCase() + words[toIndex + 1].slice(1);
      recipient = recipient.replace(/[^a-zA-Z]/g, '');
    }
    
    // Validate extraction
    if (!amount || !symbol || !recipient) {
      return res.status(400).json({ 
        error: 'Could not parse transfer request',
        message: 'Please provide amount, token symbol, and recipient in your query',
        parsed: { amount, symbol, recipient }
      });
    }
    
    // Create the transfer
    const txId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
    
    const newTransfer = {
      txId,
      from: user || 'Alice',
      fromAccount: '0.0.12346',
      to: recipient,
      toAccount: recipient === 'Bob' ? '0.0.73921' : (recipient === 'Charlie' ? '0.0.54892' : '0.0.38475'),
      symbol,
      amount,
      value: parseFloat((amount * 25.30).toFixed(2)),
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    };
    
    // Add to history
    transferHistory.unshift(newTransfer);
    
    // Return success response
    setTimeout(() => {
      res.status(201).json({
        transaction: newTransfer,
        message: `Successfully transferred ${amount} ${symbol} tokens to ${recipient}`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  } catch (error) {
    console.error('Error processing NL transfer:', error);
    res.status(500).json({ 
      error: 'Transfer failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 
