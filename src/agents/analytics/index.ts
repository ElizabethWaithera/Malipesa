import { logger } from '../../utils/logger';
import { AgentResult, AnalyticsInsight, TokenizedStock } from '../../utils/types';
import { BaseAgent } from '../baseAgent';

/**
 * Analytics Agent
 * Responsible for analyzing tokenized stocks and generating insights
 */
export class AnalyticsAgent extends BaseAgent {
  private insights: Map<string, AnalyticsInsight> = new Map();
  
  /**
   * Constructor for AnalyticsAgent
   */
  constructor() {
    super({
      name: 'AnalyticsAgent',
      version: '1.0.0',
      enabled: true,
      intervalMs: 3600000, // Default to hourly analysis
      settings: {
        confidenceThreshold: 0.65,
        sentimentInfluence: 0.4,
        marketFactors: ['market_trend', 'volatility', 'volume', 'sector_performance'],
        technicalIndicators: ['moving_average', 'rsi', 'macd', 'price_momentum'],
        fundamentalFactors: ['dividend_yield', 'industry_growth', 'market_cap']
      }
    });
    
    logger.info('Analytics Agent initialized');
  }
  
  /**
   * Analyze tokenized stocks
   * @param tokenizedStocks Array of tokenized stocks to analyze
   * @returns Array of analytics insights
   */
  async analyzeTokens(tokenizedStocks: TokenizedStock[]): Promise<AnalyticsInsight[]> {
    logger.info(`Analyzing ${tokenizedStocks.length} tokenized stocks`);
    
    const insights: AnalyticsInsight[] = [];
    
    for (const token of tokenizedStocks) {
      try {
        // Generate insights for this token
        const insight = await this.generateInsight(token);
        insights.push(insight);
        this.insights.set(token.symbol, insight);
      } catch (error) {
        logger.error(`Error analyzing token ${token.symbol}:`, error);
      }
    }
    
    // Emit event with insights
    super.emit('insightsGenerated', insights);
    
    logger.info(`Generated insights for ${insights.length} tokens`);
    return insights;
  }
  
  /**
   * Generate an analytics insight for a tokenized stock
   * @param token Tokenized stock
   * @returns Analytics insight
   */
  private async generateInsight(token: TokenizedStock): Promise<AnalyticsInsight> {
    // Parse metadata
    const metadata = JSON.parse(token.metadata);
    
    // In a real implementation, this would use AI models and technical analysis
    // For demonstration, we'll create synthetic insights
    
    // Generate a sentiment score between -0.7 and 0.7
    // Use deterministic formula based on symbol to keep consistent between runs
    const symbolSeed = token.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sentiment = ((symbolSeed % 14) / 10) - 0.7;
    
    // Determine recommendation based on sentiment
    let recommendation: 'BUY' | 'SELL' | 'HOLD';
    if (sentiment > 0.25) recommendation = 'BUY';
    else if (sentiment < -0.25) recommendation = 'SELL';
    else recommendation = 'HOLD';
    
    // Generate deterministic prediction based on sentiment and token value
    const baseChange = sentiment * 15; // Convert sentiment to percentage
    
    // Short term (1-7 days)
    const shortTermChange = baseChange + ((symbolSeed % 10) / 10);
    const shortTermPrice = token.value * (1 + shortTermChange / 100);
    
    // Medium term (1-3 months)
    const mediumTermChange = baseChange * 1.5 + ((symbolSeed % 8) / 4);
    const mediumTermPrice = token.value * (1 + mediumTermChange / 100);
    
    // Long term (6-12 months)
    const longTermChange = baseChange * 2.2 + ((symbolSeed % 20) / 5);
    const longTermPrice = token.value * (1 + longTermChange / 100);
    
    // Generate factors
    const possibleFactors = [
      'positive earnings growth',
      'strong technical indicators',
      'increased trading volume',
      'sector outlook improvement',
      'favorable market conditions',
      'high dividend yield',
      'analyst upgrades',
      'negative earnings forecast',
      'poor technical indicators',
      'reduced trading volume',
      'sector outlook deterioration',
      'unfavorable market conditions',
      'dividend reduction',
      'analyst downgrades',
      'competitive pressure',
      'innovation potential',
      'management changes',
      'regulatory challenges',
      'market share growth',
      'cost reduction initiatives'
    ];
    
    // Select factors based on recommendation
    const factorCount = 3 + (symbolSeed % 3); // 3-5 factors
    let factorPool: string[];
    
    if (recommendation === 'BUY') {
      factorPool = possibleFactors.slice(0, 7); // Positive factors
    } else if (recommendation === 'SELL') {
      factorPool = possibleFactors.slice(7, 14); // Negative factors
    } else {
      factorPool = possibleFactors.slice(14); // Neutral factors
    }
    
    // Pick factors from the appropriate pool
    const factors: string[] = [];
    for (let i = 0; i < factorCount; i++) {
      const index = (symbolSeed + i * 17) % factorPool.length;
      factors.push(factorPool[index]);
    }
    
    // Calculate confidence based on various factors
    const confidence = 0.5 + (Math.abs(sentiment) * 0.3) + ((symbolSeed % 20) / 100);
    
    // Construct the insight
    const insight: AnalyticsInsight = {
      symbol: token.symbol,
      tokenId: token.tokenId,
      sentiment,
      recommendation,
      confidence,
      factors,
      prediction: {
        shortTerm: {
          timeframe: '1-7 days',
          expectedPrice: parseFloat(shortTermPrice.toFixed(2)),
          percentChange: parseFloat(shortTermChange.toFixed(2)),
          confidence: parseFloat((0.8 - Math.abs(sentiment) * 0.2).toFixed(2))
        },
        mediumTerm: {
          timeframe: '1-3 months',
          expectedPrice: parseFloat(mediumTermPrice.toFixed(2)),
          percentChange: parseFloat(mediumTermChange.toFixed(2)),
          confidence: parseFloat((0.7 - Math.abs(sentiment) * 0.3).toFixed(2))
        },
        longTerm: {
          timeframe: '6-12 months',
          expectedPrice: parseFloat(longTermPrice.toFixed(2)),
          percentChange: parseFloat(longTermChange.toFixed(2)),
          confidence: parseFloat((0.6 - Math.abs(sentiment) * 0.4).toFixed(2))
        }
      },
      timestamp: new Date()
    };
    
    logger.info(`Generated insight for ${token.symbol}: ${recommendation} with ${confidence.toFixed(2)} confidence`);
    return insight;
  }
  
  /**
   * Get an insight by stock symbol
   * @param symbol Stock symbol
   * @returns Insight or null if not found
   */
  getInsight(symbol: string): AnalyticsInsight | null {
    return this.insights.get(symbol) || null;
  }
  
  /**
   * Get all insights
   * @returns Array of all insights
   */
  getAllInsights(): AnalyticsInsight[] {
    return Array.from(this.insights.values());
  }
  
  /**
   * Main task execution method
   * @returns AgentResult with insights data
   */
  protected async executeTask(): Promise<AgentResult<AnalyticsInsight[]>> {
    const startTime = Date.now();
    try {
      logger.info('Executing scheduled analytics task');
      
      // In a real implementation, this would refresh insights based on new data
      // For demonstration, we'll just return the existing insights
      
      const processingTime = Date.now() - startTime;
      logger.info(`Analytics task completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: Array.from(this.insights.values()),
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error in analytics task:', error);
      
      return {
        success: false,
        error: error as Error,
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    }
  }
} 
