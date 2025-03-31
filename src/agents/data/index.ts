import { logger } from '../../utils/logger';
import { generateSyntheticStockData, updateSyntheticStockPrices } from '../../utils/syntheticData';
import { StockData } from '../../utils/types';
import { BaseAgent } from '../baseAgent';

/**
 * Data Ingestion Agent
 * Responsible for fetching stock data from NSE or mock data provider
 */
export class DataIngestionAgent extends BaseAgent {
  private cachedStockData: StockData[] = [];
  private lastUpdated: Date | null = null;
  private updateInProgress: boolean = false;
  
  /**
   * Constructor for DataIngestionAgent
   */
  constructor() {
    super({
      name: 'DataIngestionAgent',
      version: '1.0.0',
      enabled: true,
      intervalMs: 60000, // Default 1 minute data refresh interval
      settings: {
        useRealData: false, // Set to false to use synthetic data
        dataEndpoint: process.env.NSE_API_URL || 'https://api.example.com/nse',
        apiKey: process.env.NSE_API_KEY,
        symbols: [] // Empty means fetch all available
      }
    });
    
    // Override refresh interval from env if available
    if (process.env.DATA_REFRESH_INTERVAL) {
      this.intervalMs = parseInt(process.env.DATA_REFRESH_INTERVAL, 10);
    }
    
    logger.info('Data Ingestion Agent initialized');
  }
  
  /**
   * Fetch and ingest stock data
   * @returns Promise<StockData[]> with the latest stock data
   */
  async ingestStockData(): Promise<StockData[]> {
    if (this.updateInProgress) {
      logger.info('Data update already in progress, returning cached data');
      return this.cachedStockData;
    }
    
    try {
      this.updateInProgress = true;
      
      // Check if we already have cached data that's recent enough
      const now = new Date();
      if (
        this.cachedStockData.length > 0 && 
        this.lastUpdated && 
        (now.getTime() - this.lastUpdated.getTime() < this.intervalMs!)
      ) {
        logger.info('Using cached stock data');
        return this.cachedStockData;
      }
      
      // Decide whether to use real or synthetic data
      if (this.settings.useRealData) {
        // For a real implementation, you would fetch data from NSE API here
        logger.info('Fetching real stock data from NSE API');
        throw new Error('Real NSE API data fetching not implemented');
      } else {
        logger.info('Generating synthetic stock data');
        if (this.cachedStockData.length === 0) {
          // First-time generation of synthetic data
          this.cachedStockData = generateSyntheticStockData();
        } else {
          // Update existing synthetic data with price movements
          this.cachedStockData = updateSyntheticStockPrices(this.cachedStockData);
        }
      }
      
      // Update last updated timestamp
      this.lastUpdated = now;
      
      // Emit data updated event
      super.emit('dataUpdated', this.cachedStockData);
      
      logger.info(`Stock data ingested for ${this.cachedStockData.length} symbols`);
      return this.cachedStockData;
    } catch (error) {
      logger.error('Error ingesting stock data:', error);
      
      // If we have cached data, return it despite the error
      if (this.cachedStockData.length > 0) {
        logger.info('Returning cached data due to error');
        return this.cachedStockData;
      }
      
      throw error;
    } finally {
      this.updateInProgress = false;
    }
  }
  
  /**
   * Get stock by symbol
   * @param symbol Stock symbol to look up
   * @returns Stock data or null if not found
   */
  async getStock(symbol: string): Promise<StockData | null> {
    // Ensure we have data
    const stocks = await this.ingestStockData();
    
    // Find the stock by symbol
    return stocks.find(stock => stock.symbol === symbol) || null;
  }
  
  /**
   * Main task execution method
   * @returns StockData[] on success or Error on failure
   */
  protected async executeTask(): Promise<any> {
    const startTime = Date.now();
    try {
      logger.info('Executing scheduled data ingestion task');
      
      const stocks = await this.ingestStockData();
      
      const processingTime = Date.now() - startTime;
      logger.info(`Data ingestion task completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: stocks,
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error in data ingestion task:', error);
      
      return {
        success: false,
        error: error,
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    }
  }
} 
