const {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
} = require("@hashgraph/sdk");
require("dotenv").config();

class HederaService {
  constructor() {
    // Initialize Hedera client
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
      PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
    );
  }

  // Create a new token for a stock
  async createStockToken(stockSymbol, stockName) {
    try {
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(`${stockName} Token`)
        .setTokenSymbol(stockSymbol)
        .setDecimals(2)
        .setInitialSupply(1000000)
        .setTreasuryAccountId(
          AccountId.fromString(process.env.HEDERA_ACCOUNT_ID)
        )
        .setFreezeDefault(false);

      const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(
        this.client
      );
      const tokenId = tokenCreateReceipt.tokenId;

      return tokenId;
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  }

  // Mint tokens for a specific stock
  async mintTokens(tokenId, amount, recipientAccountId) {
    try {
      const tokenMintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount);

      const tokenMintSubmit = await tokenMintTx.execute(this.client);
      const tokenMintReceipt = await tokenMintSubmit.getReceipt(this.client);

      // Transfer tokens to recipient
      const tokenTransferTx = new TokenTransferTransaction()
        .addTokenTransfer(
          tokenId,
          AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
          -amount
        )
        .addTokenTransfer(
          tokenId,
          AccountId.fromString(recipientAccountId),
          amount
        );

      const tokenTransferSubmit = await tokenTransferTx.execute(this.client);
      const tokenTransferReceipt = await tokenTransferSubmit.getReceipt(
        this.client
      );

      return tokenTransferReceipt;
    } catch (error) {
      console.error("Error minting tokens:", error);
      throw error;
    }
  }

  // Transfer tokens between accounts
  async transferTokens(tokenId, fromAccountId, toAccountId, amount) {
    try {
      const tokenTransferTx = new TokenTransferTransaction()
        .addTokenTransfer(tokenId, AccountId.fromString(fromAccountId), -amount)
        .addTokenTransfer(tokenId, AccountId.fromString(toAccountId), amount);

      const tokenTransferSubmit = await tokenTransferTx.execute(this.client);
      const tokenTransferReceipt = await tokenTransferSubmit.getReceipt(
        this.client
      );

      return tokenTransferReceipt;
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  }

  // Get token balance for an account
  async getTokenBalance(tokenId, accountId) {
    try {
      const balance = await this.client.getTokenBalance(
        TokenId.fromString(tokenId),
        AccountId.fromString(accountId)
      );
      return balance;
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw error;
    }
  }
}

module.exports = new HederaService();
