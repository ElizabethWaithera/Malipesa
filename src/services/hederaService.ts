import {
    AccountId,
    Client,
    PrivateKey,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenMintTransaction,
    TokenSupplyType,
    TokenType,
    TokenUpdateTransaction,
    TransferTransaction
} from '@hashgraph/sdk';
import config from '../config/config';
import { logger } from '../utils/logger';

/**
 * Service for interacting with the Hedera network
 */
export class HederaService {
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  /**
   * Initialize the Hedera service
   */
  constructor() {
    try {
      const { operatorId, operatorKey, network } = config.hedera;

      if (!operatorId || !operatorKey) {
        throw new Error('Environment variables HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be present');
      }

      // Create Hedera client
      this.operatorId = AccountId.fromString(operatorId);
      this.operatorKey = PrivateKey.fromString(operatorKey);

      // Initialize client based on network
      if (network === 'mainnet') {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      // Set operator account
      this.client.setOperator(this.operatorId, this.operatorKey);

      logger.info(`Hedera service initialized on ${network}`);
    } catch (error) {
      logger.error('Error initializing Hedera service:', error);
      throw error;
    }
  }

  /**
   * Create a new token for a stock
   * @param symbol Stock symbol
   * @param name Token name
   * @param supply Initial token supply
   * @param decimals Number of decimals
   * @param metadata Additional metadata
   * @returns Token ID
   */
  async createToken(
    symbol: string,
    name: string,
    supply: number,
    decimals: number = 2,
    metadata: string
  ): Promise<string> {
    try {
      logger.info(`Creating token for ${symbol}`);

      // Convert metadata to Uint8Array
      const metadataBytes = Buffer.from(metadata);

      // Create the token
      const transaction = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(supply)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .setTokenMemo(`NSE Stock Token for ${symbol}`)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(supply * 10) // Set max supply to 10x initial
        .setMetadata(metadataBytes)
        .freezeWith(this.client);

      // Sign and execute the transaction
      const signedTx = await transaction.sign(this.operatorKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const tokenId = receipt.tokenId!.toString();

      logger.info(`Created token ${tokenId} for ${symbol}`);
      return tokenId;
    } catch (error) {
      logger.error(`Error creating token for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing token
   * @param tokenId Token ID
   * @param newName New token name (optional)
   * @param newSymbol New token symbol (optional)
   * @param newMetadata New metadata (optional)
   * @returns Transaction ID
   */
  async updateToken(
    tokenId: string,
    newName?: string,
    newSymbol?: string,
    newMetadata?: string
  ): Promise<string> {
    try {
      logger.info(`Updating token ${tokenId}`);

      let transaction = new TokenUpdateTransaction()
        .setTokenId(tokenId);

      if (newName) transaction = transaction.setTokenName(newName);
      if (newSymbol) transaction = transaction.setTokenSymbol(newSymbol);
      if (newMetadata) {
        const metadataBytes = Buffer.from(newMetadata);
        transaction = transaction.setMetadata(metadataBytes);
      }

      // Freeze, sign and execute the transaction
      const frozenTx = await transaction.freezeWith(this.client);
      const signedTx = await frozenTx.sign(this.operatorKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`Updated token ${tokenId}`);
      return txResponse.transactionId.toString();
    } catch (error) {
      logger.error(`Error updating token ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Mint additional tokens
   * @param tokenId Token ID
   * @param amount Amount to mint
   * @returns Transaction ID
   */
  async mintTokens(tokenId: string, amount: number): Promise<string> {
    try {
      logger.info(`Minting ${amount} tokens for ${tokenId}`);

      // Create the transaction
      const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .freezeWith(this.client);

      // Sign and execute the transaction
      const signedTx = await transaction.sign(this.operatorKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`Minted ${amount} tokens for ${tokenId}`);
      return txResponse.transactionId.toString();
    } catch (error) {
      logger.error(`Error minting tokens for ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Burn tokens
   * @param tokenId Token ID
   * @param amount Amount to burn
   * @returns Transaction ID
   */
  async burnTokens(tokenId: string, amount: number): Promise<string> {
    try {
      logger.info(`Burning ${amount} tokens for ${tokenId}`);

      // Create the transaction
      const transaction = await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .freezeWith(this.client);

      // Sign and execute the transaction
      const signedTx = await transaction.sign(this.operatorKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`Burned ${amount} tokens for ${tokenId}`);
      return txResponse.transactionId.toString();
    } catch (error) {
      logger.error(`Error burning tokens for ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Get token information
   * @param tokenId Token ID
   * @returns Token information
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      logger.info(`Getting information for token ${tokenId}`);

      // Query token info
      const query = new TokenInfoQuery()
        .setTokenId(tokenId);

      // Execute the query
      const tokenInfo = await query.execute(this.client);

      logger.info(`Retrieved information for token ${tokenId}`);
      return tokenInfo;
    } catch (error) {
      logger.error(`Error getting information for token ${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Transfer tokens
   * @param tokenId Token ID
   * @param fromAccountId Sender account ID
   * @param toAccountId Recipient account ID
   * @param amount Amount to transfer
   * @returns Transaction ID
   */
  async transferTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ): Promise<string> {
    try {
      logger.info(`Transferring ${amount} tokens from ${fromAccountId} to ${toAccountId}`);

      // Create the transfer transaction
      const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, AccountId.fromString(fromAccountId), -amount)
        .addTokenTransfer(tokenId, AccountId.fromString(toAccountId), amount)
        .freezeWith(this.client);

      // Sign and execute the transaction
      const signedTx = await transaction.sign(this.operatorKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`Transferred ${amount} tokens from ${fromAccountId} to ${toAccountId}`);
      return txResponse.transactionId.toString();
    } catch (error) {
      logger.error(`Error transferring tokens:`, error);
      throw error;
    }
  }

  /**
   * Close the client connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      logger.info('Hedera client connection closed');
    }
  }
} 
