import { HederaService } from '../../services/hederaService';
import { logger } from '../../utils/logger';
import { AgentResult, AnalyticsInsight } from '../../utils/types';
import { BaseAgent } from '../baseAgent';

/**
 * User Interaction Agent
 * Responsible for managing user queries and interactions related to stock tokens
 */
export class UserInteractionAgent extends BaseAgent {
  private insights: AnalyticsInsight[] = [];
  private lastQuery: string = '';
  private lastResponse: string = '';
  private hederaService: HederaService;
  private userAccounts: Map<string, string> = new Map(); // Map of username to account ID
  
  /**
   * Constructor for UserInteractionAgent
   */
  constructor() {
    super({
      name: 'UserInteractionAgent',
      version: '1.0.0',
      enabled: true,
      intervalMs: undefined, // This agent is triggered on-demand
      settings: {
        aiResponseTimeout: 10000, // 10 seconds
        maxResponseLength: 500,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'mr', 'ta']
      }
    });
    
    // Initialize Hedera service
    this.hederaService = new HederaService();
    
    // Initialize with some demo user accounts
    this.userAccounts.set('alice', '0.0.12346');
    this.userAccounts.set('bob', '0.0.12347');
    this.userAccounts.set('charlie', '0.0.12348');
    this.userAccounts.set('dave', '0.0.12349');
    this.userAccounts.set('eve', '0.0.12350');
    
    logger.info('User Interaction Agent initialized');
  }
  
  /**
   * Initialize the agent with insights
   * @param insights Analytics insights to use for responses
   */
  async initialize(insights: AnalyticsInsight[]): Promise<void> {
    this.insights = insights;
    logger.info(`User Interaction Agent initialized with ${insights.length} insights`);
    
    // In a real application, this might also initialize a chatbot,
    // connect to messaging platforms, etc.
    return Promise.resolve();
  }
  
  /**
   * Process a user query
   * @param query User query string
   * @returns Response to user
   */
  async processQuery(query: string): Promise<string> {
    logger.info(`Processing user query: ${query}`);
    this.lastQuery = query;
    
    try {
      // Check if this is a token transfer request
      const transferRequest = this.parseTokenTransferRequest(query);
      if (transferRequest) {
        logger.info(`Detected token transfer request: ${JSON.stringify(transferRequest)}`);
        return await this.handleTokenTransfer(transferRequest);
      }

      // For other queries, use the normal response generation
      const response = await this.generateResponse(query);
      this.lastResponse = response;
      
      logger.info(`Generated response for query: ${query.substring(0, 30)}...`);
      return response;
    } catch (error) {
      logger.error(`Error processing query: ${query}`, error);
      return "I'm sorry, I couldn't process your request at this time. Please try again later.";
    }
  }
  
  /**
   * Parse a query to identify token transfer requests
   * @param query User query
   * @returns Transfer details if detected, or null
   */
  private parseTokenTransferRequest(query: string): { 
    fromUser: string; 
    toUser: string; 
    symbol: string; 
    amount: number; 
    tokenId?: string;
  } | null {
    const normalizedQuery = query.toLowerCase();
    
    // Pattern for transfer requests
    // Examples:
    // "Transfer 10 RELIANCE tokens to Bob"
    // "Can you send 5 TCS shares to Alice?"
    // "I want to transfer 2 HDFCBANK tokens to Charlie"
    
    // Check if it's a transfer request
    if (
      !normalizedQuery.includes('transfer') &&
      !normalizedQuery.includes('send') &&
      !normalizedQuery.includes('give')
    ) {
      return null;
    }
    
    // Extract recipient
    let toUser = '';
    for (const user of this.userAccounts.keys()) {
      if (normalizedQuery.includes(` to ${user}`) || normalizedQuery.includes(` to ${user.toLowerCase()}`)) {
        toUser = user;
        break;
      }
    }
    
    if (!toUser) {
      return null; // No valid recipient found
    }
    
    // Extract token symbol
    let symbol = '';
    let amount = 0;
    
    // Look for numeric amount followed by symbol
    const amountSymbolMatch = normalizedQuery.match(/(\d+)\s+([a-zA-Z]+)/);
    if (amountSymbolMatch) {
      amount = parseInt(amountSymbolMatch[1], 10);
      const possibleSymbol = amountSymbolMatch[2].toUpperCase();
      
      // Verify if this is a valid symbol
      const matchingInsight = this.insights.find(i => 
        i.symbol.toLowerCase() === possibleSymbol.toLowerCase()
      );
      
      if (matchingInsight) {
        symbol = matchingInsight.symbol;
      }
    }
    
    if (!symbol || amount <= 0) {
      return null; // Invalid symbol or amount
    }
    
    // Assume the request is coming from the current user (could be enhanced with user auth)
    const fromUser = 'alice'; // Default sender for demo
    
    return {
      fromUser,
      toUser,
      symbol,
      amount,
      tokenId: this.insights.find(i => i.symbol === symbol)?.tokenId
    };
  }
  
  /**
   * Handle a token transfer request
   * @param transferRequest Transfer request details
   * @returns Response message
   */
  private async handleTokenTransfer(transferRequest: {
    fromUser: string;
    toUser: string;
    symbol: string;
    amount: number;
    tokenId?: string;
  }): Promise<string> {
    const { fromUser, toUser, symbol, amount, tokenId } = transferRequest;
    
    logger.info(`Processing transfer of ${amount} ${symbol} tokens from ${fromUser} to ${toUser}`);
    
    // Validate all required details
    if (!this.userAccounts.has(fromUser)) {
      return `I couldn't find an account for user "${fromUser}". Please check the username and try again.`;
    }
    
    if (!this.userAccounts.has(toUser)) {
      return `I couldn't find an account for user "${toUser}". Please check the username and try again.`;
    }
    
    if (!tokenId) {
      return `I couldn't find the token ID for ${symbol}. Please check if the stock has been tokenized.`;
    }
    
    const fromAccountId = this.userAccounts.get(fromUser)!;
    const toAccountId = this.userAccounts.get(toUser)!;
    
    try {
      // In a real environment, this would execute the actual transfer 
      // through the Hedera service
      
      // Simulate the transfer without actually executing it
      const isTestMode = process.env.NODE_ENV !== 'production';
      let transactionId: string;
      
      if (isTestMode) {
        // Mock transaction ID for testing
        transactionId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Execute the actual transaction
        transactionId = await this.hederaService.transferTokens(
          tokenId,
          fromAccountId,
          toAccountId,
          amount
        );
      }
      
      // Log and return success message
      logger.info(`Successfully transferred ${amount} ${symbol} tokens from ${fromUser} to ${toUser}`);
      
      // Get current token value for display
      const insight = this.insights.find(i => i.symbol === symbol);
      const valuePerToken = insight?.prediction.shortTerm.expectedPrice || 0;
      const totalValue = amount * valuePerToken;
      
      return `✅ Success! I've transferred ${amount} ${symbol} tokens (worth ₹${totalValue.toFixed(2)}) from ${fromUser} to ${toUser}. Transaction ID: ${transactionId}`;
    } catch (error) {
      logger.error(`Error processing token transfer:`, error);
      return `I'm sorry, there was an error transferring tokens: ${(error as Error).message}. Please try again later.`;
    }
  }
  
  /**
   * Main task execution method
   * @returns AgentResult<string[]>
   */
  protected async executeTask(): Promise<AgentResult<string[]>> {
    const startTime = Date.now();
    try {
      logger.info('Executing user interaction maintenance task');
      
      // In a real implementation, this might clean up old conversations,
      // update AI models, etc.
      
      const processingTime = Date.now() - startTime;
      logger.info(`User interaction maintenance task completed in ${processingTime}ms`);
      
      return {
        success: true,
        data: [this.lastQuery, this.lastResponse],
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error in user interaction maintenance task:', error);
      
      return {
        success: false,
        error: error as Error,
        timestamp: new Date(),
        processingTimeMs: processingTime
      };
    }
  }
  
  /**
   * Generate a response to a user query
   * @param query User query
   * @returns Generated response
   */
  private async generateResponse(query: string): Promise<string> {
    // Normalize query for easier matching
    const normalizedQuery = query.toLowerCase();
    
    // Check for specific stock queries
    const stockMatches = this.findStockMatches(normalizedQuery);
    if (stockMatches.length > 0) {
      return this.generateStockResponse(stockMatches[0], normalizedQuery);
    }
    
    // Check for general market insights
    if (
      normalizedQuery.includes('market') || 
      normalizedQuery.includes('overall') || 
      normalizedQuery.includes('general')
    ) {
      return this.generateMarketOverviewResponse();
    }
    
    // Check for recommendation requests
    if (
      normalizedQuery.includes('recommend') || 
      normalizedQuery.includes('suggest') || 
      normalizedQuery.includes('what should i')
    ) {
      return this.generateRecommendationResponse();
    }
    
    // Check for token-related queries
    if (
      normalizedQuery.includes('token') || 
      normalizedQuery.includes('blockchain') || 
      normalizedQuery.includes('hedera')
    ) {
      return this.generateTokenInfoResponse();
    }
    
    // Check for account or user queries
    if (
      normalizedQuery.includes('account') || 
      normalizedQuery.includes('user') || 
      normalizedQuery.includes('profile')
    ) {
      return this.generateAccountInfoResponse();
    }
    
    // Default response for unrecognized queries
    return "I can provide information about tokenized NSE stocks, market insights, and recommendations. You can ask about specific stocks like 'How is Reliance performing?' or request general market information. You can also transfer tokens by saying something like 'Transfer 5 RELIANCE tokens to Bob'.";
  }
  
  /**
   * Find matching stocks in the query
   * @param query Normalized user query
   * @returns Array of matching stock symbols
   */
  private findStockMatches(query: string): string[] {
    const matches: string[] = [];
    
    for (const insight of this.insights) {
      if (
        query.includes(insight.symbol.toLowerCase()) || 
        query.includes(insight.tokenId.toLowerCase())
      ) {
        matches.push(insight.symbol);
      }
    }
    
    return matches;
  }
  
  /**
   * Generate response for a specific stock
   * @param symbol Stock symbol
   * @param query Original query
   * @returns Response about the stock
   */
  private generateStockResponse(symbol: string, query: string): string {
    const insight = this.insights.find(i => i.symbol === symbol);
    
    if (!insight) {
      return `I don't have information about ${symbol} at the moment.`;
    }
    
    // If asking about price or value
    if (query.includes('price') || query.includes('value') || query.includes('worth')) {
      return `The current price of ${symbol} is ₹${insight.prediction.shortTerm.expectedPrice.toFixed(2)}. In the short term (${insight.prediction.shortTerm.timeframe}), I expect it to ${insight.prediction.shortTerm.percentChange > 0 ? 'increase' : 'decrease'} by about ${Math.abs(insight.prediction.shortTerm.percentChange)}%.`;
    }
    
    // If asking about recommendations
    if (query.includes('buy') || query.includes('sell') || query.includes('invest') || query.includes('recommendation')) {
      return `For ${symbol}, my current recommendation is to ${insight.recommendation}. This is based on ${insight.factors.join(' and ')}.`;
    }
    
    // If asking about predictions or forecasts
    if (query.includes('predict') || query.includes('forecast') || query.includes('future')) {
      return `My predictions for ${symbol}: Short-term (${insight.prediction.shortTerm.timeframe}): ${insight.prediction.shortTerm.percentChange > 0 ? '+' : ''}${insight.prediction.shortTerm.percentChange}%. Medium-term (${insight.prediction.mediumTerm.timeframe}): ${insight.prediction.mediumTerm.percentChange > 0 ? '+' : ''}${insight.prediction.mediumTerm.percentChange}%. Long-term (${insight.prediction.longTerm.timeframe}): ${insight.prediction.longTerm.percentChange > 0 ? '+' : ''}${insight.prediction.longTerm.percentChange}%.`;
    }
    
    // Default stock response
    return `${symbol} is currently ${insight.recommendation === 'BUY' ? 'looking promising' : insight.recommendation === 'SELL' ? 'showing concerning trends' : 'performing steadily'}. The sentiment is ${insight.sentiment > 0.3 ? 'positive' : insight.sentiment < -0.3 ? 'negative' : 'neutral'}. Key factors include ${insight.factors.slice(0, 2).join(' and ')}. Its token ID is ${insight.tokenId}.`;
  }
  
  /**
   * Generate market overview response
   * @returns Response with market overview
   */
  private generateMarketOverviewResponse(): string {
    // Count recommendations
    let buyCount = 0;
    let sellCount = 0;
    let holdCount = 0;
    
    for (const insight of this.insights) {
      if (insight.recommendation === 'BUY') buyCount++;
      else if (insight.recommendation === 'SELL') sellCount++;
      else holdCount++;
    }
    
    // Calculate average sentiment
    const avgSentiment = this.insights.reduce((sum, insight) => sum + insight.sentiment, 0) / this.insights.length;
    
    // Generate market direction description
    let marketDirection = 'mixed';
    if (buyCount > (sellCount + holdCount)) marketDirection = 'bullish';
    else if (sellCount > (buyCount + holdCount)) marketDirection = 'bearish';
    else if (holdCount > (buyCount + sellCount)) marketDirection = 'stable';
    
    // Generate response
    return `The overall market sentiment is ${avgSentiment > 0.3 ? 'positive' : avgSentiment < -0.3 ? 'negative' : 'neutral'} with a ${marketDirection} outlook. Of the stocks analyzed, ${buyCount} show buy signals, ${sellCount} show sell signals, and ${holdCount} suggest holding. ${this.getTopPerformerStatement()}`;
  }
  
  /**
   * Generate a statement about top performers
   * @returns Statement about top performers
   */
  private getTopPerformerStatement(): string {
    if (this.insights.length === 0) return '';
    
    // Sort by short-term predictions
    const sortedInsights = [...this.insights].sort(
      (a, b) => b.prediction.shortTerm.percentChange - a.prediction.shortTerm.percentChange
    );
    
    const topPerformer = sortedInsights[0];
    
    return `The top performer is expected to be ${topPerformer.symbol} with a projected ${topPerformer.prediction.shortTerm.percentChange.toFixed(2)}% change in the short term.`;
  }
  
  /**
   * Generate recommendation response
   * @returns Response with recommendations
   */
  private generateRecommendationResponse(): string {
    if (this.insights.length === 0) {
      return "I don't have enough data to make recommendations at the moment.";
    }
    
    // Filter for buy recommendations with high confidence
    const buyRecommendations = this.insights
      .filter(insight => insight.recommendation === 'BUY' && insight.confidence > 0.7)
      .sort((a, b) => b.confidence - a.confidence);
    
    if (buyRecommendations.length > 0) {
      const top = buyRecommendations[0];
      return `My top recommendation right now is ${top.symbol} with a ${parseFloat((top.confidence * 100).toFixed(2))}% confidence rating. The predicted growth is ${top.prediction.shortTerm.percentChange.toFixed(2)}% in the short term and ${top.prediction.mediumTerm.percentChange.toFixed(2)}% in the medium term. This is based on ${top.factors.slice(0, 2).join(' and ')}.`;
    } else {
      return "I don't have any strong buy recommendations at the moment. The market conditions suggest a cautious approach. Consider holding your current positions or consulting with a financial advisor.";
    }
  }
  
  /**
   * Generate token info response
   * @returns Response with token information
   */
  private generateTokenInfoResponse(): string {
    return "The NSE stock tokens on Hedera provide a blockchain representation of actual stock values. Each token is backed by real-time price data and follows the price movements of the underlying stock. These tokens can be transferred securely on the Hedera network using the hashgraph consensus algorithm, providing fast and secure transactions. Unlike traditional stocks, these tokens can be traded 24/7 and fractionally owned. You can transfer tokens to other users by saying 'Transfer 5 RELIANCE tokens to Bob'.";
  }
  
  /**
   * Generate account info response
   * @returns Response with account information
   */
  private generateAccountInfoResponse(): string {
    const userList = Array.from(this.userAccounts.keys()).join(', ');
    return `Currently, the following demo users are available for token transfers: ${userList}. You can transfer tokens to these users by saying something like 'Transfer 5 RELIANCE tokens to Bob'.`;
  }
} 
