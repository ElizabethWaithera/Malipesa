# Mali Pesa Technical Walkthrough

This document provides technical details on how the advanced Hedera features are implemented in Mali Pesa.

## System Architecture

Mali Pesa follows a client-server architecture:

- **Frontend**: HTML/CSS/JavaScript with Bootstrap for UI
- **Backend**: Node.js with Express
- **Blockchain**: Hedera Hashgraph

The application connects to Hedera's testnet using the Hedera JavaScript SDK (`@hashgraph/sdk`).

## Hedera Integration

### Account Setup

The application uses a Hedera client configuration to connect to the testnet:

```javascript
// From server/hedera/hederaService.js
function getClient() {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  return client;
}
```

### Tokenization Implementation

Tokenization uses Hedera's Token Service to create and manage fungible tokens representing stocks.

## Advanced Hedera Features

### 1. Token Swap Service

The swap functionality uses Hedera's Transfer Transaction to atomically exchange tokens between accounts:

```javascript
// Create atomic swap using Hedera Transfer Transaction
const transaction = await new TransferTransaction()
  // Transfer fromToken from sender to recipient
  .addTokenTransfer(fromTokenId, fromAccountId, -fromAmount)
  .addTokenTransfer(fromTokenId, toAccountId, fromAmount)
  // Transfer toToken from recipient to sender
  .addTokenTransfer(toTokenId, toAccountId, -toAmount)
  .addTokenTransfer(toTokenId, fromAccountId, toAmount)
  .freezeWith(client);
```

This ensures that both transfers occur together as a single atomic transaction, avoiding partial swaps.

### 2. Staking Service

The staking mechanism involves:

1. Transferring tokens to a staking contract account using Hedera's Transfer Transaction
2. Recording staking details in a database or using Hedera Consensus Service (HCS)
3. Calculating rewards based on staking period and APY
4. Transferring tokens plus rewards back to the user upon unstaking

```javascript
// Transfer tokens to staking contract account
const transaction = await new TransferTransaction()
  .addTokenTransfer(tokenId, accountId, -amount)
  .addTokenTransfer(tokenId, stakingContractId, amount)
  .freezeWith(client);
```

For unstaking, a similar process is followed in reverse, plus rewards:

```javascript
// Transfer tokens back to user with rewards
const transaction = await new TransferTransaction()
  .addTokenTransfer(stake.tokenId, stakingContractId, -totalAmount)
  .addTokenTransfer(stake.tokenId, accountId, totalAmount)
  .freezeWith(client);
```

### 3. Marketplace Service

The marketplace uses Hedera's Transfer Transaction to handle HBAR and token transfers simultaneously:

```javascript
// Execute atomic swap: HBAR from buyer to seller, tokens from seller to buyer
const transaction = await new TransferTransaction()
  // Transfer HBAR from buyer to seller
  .addHbarTransfer(buyerAccountId, new Hbar(-totalCost))
  .addHbarTransfer(listing.sellerAccountId, new Hbar(totalCost))
  // Transfer tokens from seller to buyer
  .addTokenTransfer(listing.tokenId, listing.sellerAccountId, -amount)
  .addTokenTransfer(listing.tokenId, buyerAccountId, amount)
  .freezeWith(client);
```

This ensures that payment and token delivery happen atomically - either both succeed or both fail.

## API Integration

The backend API routes connect the frontend to the Hedera services:

```javascript
// server/api/swap.js (example)
router.post('/token', async (req, res) => {
  try {
    const { fromTokenId, toTokenId, fromAccountId, toAccountId, fromAmount } = req.body;
    
    // Execute swap using the swap service
    const result = await swapService.swapTokens(
      fromTokenId, toTokenId, fromAccountId, toAccountId, fromAmount
    );
    
    res.json({
      success: true,
      message: 'Swap completed successfully',
      transactionId: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Security Considerations

- All transactions require proper Hedera account authentication
- Private keys are stored securely in environment variables
- API endpoints validate all inputs before processing
- Transactions use Hedera's secure consensus for finality

## Key Technical Benefits of Hedera

1. **Atomic Swaps**: Hedera's TransferTransaction allows multiple token transfers in a single atomic operation
2. **Security**: aBFT consensus algorithm provides high security with finality in seconds
3. **Low Fees**: Transactions cost significantly less than Ethereum or other blockchain networks
4. **High Performance**: Thousands of transactions per second with low latency
5. **Tokenization**: Native token creation and management without smart contracts

## Future Technical Enhancements

1. Implement Hedera's Smart Contract Service for more complex DeFi features
2. Add liquidity pools to improve token swap experiences
3. Integrate with Hedera's State Proofs for enhanced security
4. Implement cross-chain bridges for interoperability with other networks
