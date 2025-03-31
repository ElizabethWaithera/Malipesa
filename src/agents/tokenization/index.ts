import { ContractService } from '../../services/contractService';
import { HederaService } from '../../services/hederaService';
import { logger } from '../../utils/logger';
import { AgentResult, StockData, TokenizedStock } from '../../utils/types';
import { BaseAgent } from '../baseAgent';

/**
 * Tokenization Agent
 * Responsible for tokenizing stock data on Hedera
 */
export class TokenizationAgent extends BaseAgent {
  private hederaService: HederaService;
  private contractService: ContractService;
  private tokenizedStocks: Map<string, TokenizedStock> = new Map();
  
  /**
   * Constructor for TokenizationAgent
   */
  constructor() {
    super({
      name: 'TokenizationAgent',
      version: '1.0.0',
      enabled: true,
      intervalMs: undefined, // This agent is triggered on-demand
      settings: {
        tokenDecimals: 2,
        tokenSupplyMultiplier: 1000, // Each stock gets 1000 tokens initially
        includeMetadata: true,
        executeMigration: false
      }
    });
    
    // Initialize services
    this.hederaService = new HederaService();
    this.contractService = new ContractService(this.hederaService);
    
    logger.info('Tokenization Agent initialized');
  }
  
  /**
   * Tokenize multiple stocks
   * @param stocks Stock data array
   * @returns Array of tokenized stocks
   */
  async tokenizeStocks(stocks: StockData[]): Promise<TokenizedStock[]> {
    logger.info(`Tokenizing ${stocks.length} stocks`);
    
    const tokenizedStocks: TokenizedStock[] = [];
    for (const stock of stocks) {
      try {
        // Check if already tokenized
        const existingToken = this.tokenizedStocks.get(stock.symbol);
        if (existingToken) {
          // Update the token if needed
          await this.updateTokenizedStock(existingToken, stock);
          tokenizedStocks.push(existingToken);
          continue;
        }
        
        // Tokenize the stock
        const tokenizedStock = await this.tokenizeStock(stock);
        tokenizedStocks.push(tokenizedStock);
        
        // Store in map
        this.tokenizedStocks.set(stock.symbol, tokenizedStock);
        
        logger.info(`Tokenized stock ${stock.symbol} with token ID ${tokenizedStock.tokenId}`);
      } catch (error) {
        logger.error(`Error tokenizing stock ${stock.symbol}:`, error);
      }
    }
    
    // Emit event for tokenization completion
    super.emit('stocksTokenized', tokenizedStocks);
    
    return tokenizedStocks;
  }
  
  /**
   * Tokenize a single stock
   * @param stock Stock data
   * @returns Tokenized stock
   */
  private async tokenizeStock(stock: StockData): Promise<TokenizedStock> {
    logger.info(`Creating token for ${stock.symbol}`);
    
    try {
      // Create token metadata
      const metadata = JSON.stringify({
        symbol: stock.symbol,
        name: stock.name,
        industry: stock.industry,
        sector: stock.sector,
        lastPrice: stock.lastPrice,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
        createdAt: new Date().toISOString()
      });
      
      // Calculate initial supply based on price
      // For example, higher-priced stocks get fewer tokens
      const baseSupply = this.settings.tokenSupplyMultiplier;
      const initialSupply = baseSupply;
      
      // Create token on Hedera
      const isTestMode = process.env.NODE_ENV !== 'production';
      let tokenId: string;
      
      if (isTestMode) {
        // Generate a mock token ID for testing
        tokenId = `0.0.${1000000 + Math.floor(Math.random() * 1000000)}`;
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Create actual token on Hedera
        tokenId = await this.hederaService.createToken(
          stock.symbol,
          `${stock.name} Token`,
          initialSupply,
          this.settings.tokenDecimals,
          metadata
        );
      }
      
      // Create contract on Hedera (for more complex functionality)
      const contractId = await this.contractService.createStockTokenContract(stock);
      
      // Create tokenized stock record
      const tokenizedStock: TokenizedStock = {
        symbol: stock.symbol,
        name: stock.name,
        tokenId: tokenId,
        contractId: contractId,
        supply: initialSupply,
        value: stock.lastPrice,
        metadata: metadata,
        lastUpdate: new Date()
      };
      
      return tokenizedStock;
    } catch (error) {
      logger.error(`Error creating token for ${stock.symbol}:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing tokenized stock
   * @param tokenizedStock Existing tokenized stock
   * @param stock Updated stock data
   * @returns Updated tokenized stock
   */
  private async updateTokenizedStock(tokenizedStock: TokenizedStock, stock: StockData): Promise<TokenizedStock> {
    // Update value
    tokenizedStock.value = stock.lastPrice;
    tokenizedStock.lastUpdate = new Date();
    
    // Update metadata if needed
    if (stock.industry !== JSON.parse(tokenizedStock.metadata).industry ||
        stock.sector !== JSON.parse(tokenizedStock.metadata).sector ||
        stock.dividendYield !== JSON.parse(tokenizedStock.metadata).dividendYield) {
      
      // Update metadata
      const newMetadata = JSON.stringify({
        symbol: stock.symbol,
        name: stock.name,
        industry: stock.industry,
        sector: stock.sector,
        lastPrice: stock.lastPrice,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
        updatedAt: new Date().toISOString()
      });
      
      // Update Hedera token metadata
      const isTestMode = process.env.NODE_ENV !== 'production';
      if (!isTestMode) {
        await this.hederaService.updateToken(
          tokenizedStock.tokenId,
          undefined, // No name change
          undefined, // No symbol change
          newMetadata
        );
      }
      
      // Update contract metadata
      await this.contractService.updateStockMetadata(
        stock.symbol,
        stock.industry,
        stock.sector,
        stock.dividendYield
      );
      
      tokenizedStock.metadata = newMetadata;
    }
    
    return tokenizedStock;
  }
  
  /**
   * Get a tokenized stock by symbol
   * @param symbol Stock symbol
   * @returns Tokenized stock or null if not found
   */
  getTokenizedStock(symbol: string): TokenizedStock | null {
    return this.tokenizedStocks.get(symbol) || null;
  }
  
  /**
   * Get all tokenized stocks
   * @returns Array of all tokenized stocks
   */
  getAllTokenizedStocks(): TokenizedStock[] {
    return Array.from(this.tokenizedStocks.values());
  }
  
  /**
   * Main task execution method
   * @returns AgentResult with tokenized stocks data
   */
  protected async executeTask(): Promise<AgentResult<TokenizedStock[]>> {
    const startTime = Date.now();
    try {
      logger.info('Executing tokenization maintenance task');
      
      // In a real implementation, this might update token prices,
      // collect and distribute dividends, etc.
      
      const processingTime = Date.now() - startTime;
      logger.info(`Tokenization maintenance task completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: Array.from(this.tokenizedStocks.values()),
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error in tokenization maintenance task:', error);
      
      return {
        success: false,
        error: error as Error,
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    }
  }
} 
