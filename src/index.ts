import dotenv from 'dotenv';
import { AnalyticsAgent } from './agents/analytics';
import { DataIngestionAgent } from './agents/data';
import { UserInteractionAgent } from './agents/interaction';
import { TokenizationAgent } from './agents/tokenization';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Main function to run the application in standalone mode
 */
async function main() {
  try {
    logger.info('Starting Hedera AI Agent Toolkit...');

    // Initialize agents
    const dataAgent = new DataIngestionAgent();
    const tokenizationAgent = new TokenizationAgent();
    const analyticsAgent = new AnalyticsAgent();
    const interactionAgent = new UserInteractionAgent();

    // Start data ingestion
    logger.info('Starting data ingestion agent...');
    const stockData = await dataAgent.ingestStockData();
    
    // Process tokenization
    logger.info('Starting tokenization agent...');
    const tokenizedData = await tokenizationAgent.tokenizeStocks(stockData);
    
    // Run analytics
    logger.info('Starting analytics agent...');
    const insights = await analyticsAgent.analyzeTokens(tokenizedData);
    
    // Start user interaction
    logger.info('Starting user interaction agent...');
    await interactionAgent.initialize(insights);
    
    logger.info('All agents initialized successfully');

    // If running in CLI mode, we can display some useful information
    const argv = process.argv || [];
    if (argv.includes('--cli')) {
      displayCliSummary(stockData, tokenizedData, insights);
    }

    // If server mode is requested, start the API server
    if (argv.includes('--server')) {
      logger.info('Starting API server...');
      // Import the server module dynamically to avoid circular dependencies
      const { default: startServer } = await import('./server');
    }

  } catch (error) {
    logger.error('Error in main application:', error);
    process.exit(1);
  }
}

/**
 * Display a summary of the data in CLI mode
 */
function displayCliSummary(stockData: any, tokenizedData: any, insights: any) {
  console.log('\n=== NSE Stock Data ===');
  stockData.forEach((stock: any) => {
    console.log(`${stock.symbol}: ₹${stock.lastPrice} (${stock.percentChange > 0 ? '+' : ''}${stock.percentChange}%)`);
  });

  console.log('\n=== Tokenized Stocks ===');
  tokenizedData.forEach((token: any) => {
    console.log(`${token.symbol}: Token ID ${token.tokenId}, Value: ₹${token.value}`);
  });

  console.log('\n=== Market Insights ===');
  const recommendations = {
    BUY: insights.filter((i: any) => i.recommendation === 'BUY').length,
    SELL: insights.filter((i: any) => i.recommendation === 'SELL').length,
    HOLD: insights.filter((i: any) => i.recommendation === 'HOLD').length
  };
  console.log(`Recommendations: ${recommendations.BUY} Buy, ${recommendations.SELL} Sell, ${recommendations.HOLD} Hold`);

  // Display top performer
  const topPerformer = [...insights].sort(
    (a: any, b: any) => b.prediction.shortTerm.percentChange - a.prediction.shortTerm.percentChange
  )[0];
  console.log(`Top performer: ${topPerformer.symbol} (${topPerformer.prediction.shortTerm.percentChange > 0 ? '+' : ''}${topPerformer.prediction.shortTerm.percentChange}%)`);

  console.log('\nUse the API server mode to interact with agents via HTTP endpoints.');
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Unhandled error in main:', error);
    process.exit(1);
  });
}

// Export the main function for use by other modules
export { main };
