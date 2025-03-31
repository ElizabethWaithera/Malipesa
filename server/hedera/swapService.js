const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  Hbar,
  AccountId,
  PrivateKey,
  Client,
} = require("@hashgraph/sdk");

// Configure client connection
function getClient() {
  // Get operator from environment variables
  const operatorId = process.env.HEDERA_ACCOUNT_ID;
  const operatorKey = process.env.HEDERA_PRIVATE_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error(
      "Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present"
    );
  }

  // Create client connection
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  return client;
}

class SwapService {
  constructor() {
    this.client = getClient();
  }

  /**
   * Execute a token swap between two tokens
   * @param {string} fromTokenId - The ID of the token to swap from
   * @param {string} toTokenId - The ID of the token to swap to
   * @param {string} fromAccountId - The account sending tokens
   * @param {string} toAccountId - The account receiving tokens
   * @param {number} fromAmount - The amount of tokens to send
   * @param {number} toAmount - The amount of tokens to receive
   * @returns {Promise<string>} The transaction ID
   */
  async swapTokens(
    fromTokenId,
    toTokenId,
    fromAccountId,
    toAccountId,
    fromAmount,
    toAmount
  ) {
    try {
      console.log(
        `Initiating token swap: ${fromAmount} of ${fromTokenId} for ${toAmount} of ${toTokenId}`
      );

      // Create transaction to swap tokens
      const transaction = new TransferTransaction()
        // First leg: sender sends their tokens
        .addTokenTransfer(fromTokenId, fromAccountId, -fromAmount)
        .addTokenTransfer(fromTokenId, toAccountId, fromAmount)
        // Second leg: receiver sends their tokens
        .addTokenTransfer(toTokenId, toAccountId, -toAmount)
        .addTokenTransfer(toTokenId, fromAccountId, toAmount)
        .freezeWith(this.client);

      // Sign and execute the transaction
      const txResponse = await transaction.execute(this.client);

      // Get the receipt
      const receipt = await txResponse.getReceipt(this.client);

      console.log(
        `Token swap successful with status: ${receipt.status.toString()}`
      );

      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error during token swap:", error);
      throw error;
    }
  }

  /**
   * Swap tokens for HBAR
   * @param {string} tokenId - The token ID to swap
   * @param {string} accountId - The account ID containing the tokens
   * @param {number} tokenAmount - The amount of tokens to swap
   * @param {number} hbarAmount - The amount of HBAR to receive in exchange
   * @param {string} counterpartyId - The account providing HBAR
   * @returns {Promise<string>} The transaction ID
   */
  async swapTokenForHbar(
    tokenId,
    accountId,
    tokenAmount,
    hbarAmount,
    counterpartyId
  ) {
    try {
      console.log(
        `Swapping ${tokenAmount} of ${tokenId} for ${hbarAmount} HBAR`
      );

      // Create an atomic transaction that transfers both the token and HBAR
      const transaction = new TransferTransaction()
        // Token leg: sender transfers tokens to counterparty
        .addTokenTransfer(tokenId, accountId, -tokenAmount)
        .addTokenTransfer(tokenId, counterpartyId, tokenAmount)
        // HBAR leg: counterparty transfers HBAR to sender
        .addHbarTransfer(counterpartyId, new Hbar(-hbarAmount))
        .addHbarTransfer(accountId, new Hbar(hbarAmount))
        .freezeWith(this.client);

      // Submit the transaction
      const txResponse = await transaction.execute(this.client);

      // Get the receipt
      const receipt = await txResponse.getReceipt(this.client);

      console.log(
        `Token-HBAR swap successful with status: ${receipt.status.toString()}`
      );

      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error during token-HBAR swap:", error);
      throw error;
    }
  }

  /**
   * Get the current exchange rate between two tokens
   * In a production app, this would connect to an oracle or price feed
   * For demo purposes, we're using a simple calculation
   * @param {string} tokenId1
   * @param {string} tokenId2
   * @returns {Promise<{rate: number, timestamp: number}>}
   */
  async getExchangeRate(tokenId1, tokenId2) {
    // This is a mock implementation - in a real application, you would:
    // 1. Query a price oracle or exchange
    // 2. Use a consensus service for price feeds
    // 3. Implement an order book matching engine

    // For demo, generate a somewhat realistic exchange rate
    const baseRates = {
      "0.0.123456": 25.3, // SCOM-T price in KES
      "0.0.123457": 45.85, // EQTY-T price in KES
      "0.0.123458": 36.95, // KCB-T price in KES
      HBAR: 36.2, // HBAR price in KES
    };

    // Get the base rates or use default values
    const rate1 = baseRates[tokenId1] || 30;
    const rate2 = baseRates[tokenId2] || 40;

    // Calculate the exchange rate
    const exchangeRate = rate1 / rate2;

    return {
      rate: exchangeRate,
      timestamp: Date.now(),
    };
  }
}

module.exports = new SwapService();
