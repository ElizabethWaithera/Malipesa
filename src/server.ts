import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { AnalyticsAgent } from './agents/analytics';
import { DataIngestionAgent } from './agents/data';
import { UserInteractionAgent } from './agents/interaction';
import { TokenizationAgent } from './agents/tokenization';
import config from './config/config';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
app.use(express.json());

// Initialize agents
const dataAgent = new DataIngestionAgent();
const tokenizationAgent = new TokenizationAgent();
const analyticsAgent = new AnalyticsAgent();
const interactionAgent = new UserInteractionAgent();

// Store initialization status
let initialized = false;

// Initialize all agents
async function initializeAgents() {
  try {
    logger.info('Initializing all agents...');
    
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
    
    initialized = true;
    logger.info('All agents initialized successfully');
    
    return { stockData, tokenizedData, insights };
  } catch (error) {
    logger.error('Error initializing agents:', error);
    throw error;
  }
}

// Define API routes

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    initialized,
    time: new Date().toISOString()
  });
});

// Initialize agents endpoint
app.post('/api/init', async (req: Request, res: Response) => {
  try {
    if (initialized) {
      return res.json({
        success: true,
        message: 'Agents already initialized'
      });
    }
    
    await initializeAgents();
    
    res.json({
      success: true,
      message: 'Agents initialized successfully'
    });
  } catch (error) {
    logger.error('Error in /api/init:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize agents',
      error: (error as Error).message
    });
  }
});

// Get stock data endpoint
app.get('/api/stocks', async (req: Request, res: Response) => {
  try {
    const stockData = await dataAgent.ingestStockData();
    res.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    logger.error('Error in /api/stocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock data',
      error: (error as Error).message
    });
  }
});

// Get tokenized stocks endpoint
app.get('/api/tokens', async (req: Request, res: Response) => {
  try {
    const tokens = tokenizationAgent.getAllTokenizedStocks();
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Error in /api/tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tokenized stocks',
      error: (error as Error).message
    });
  }
});

// Get analytics insights endpoint
app.get('/api/insights', async (req: Request, res: Response) => {
  try {
    const insights = analyticsAgent.getAllInsights();
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Error in /api/insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics insights',
      error: (error as Error).message
    });
  }
});

// Process user query endpoint
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    const response = await interactionAgent.processQuery(query);
    
    res.json({
      success: true,
      query,
      response
    });
  } catch (error) {
    logger.error('Error in /api/query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process query',
      error: (error as Error).message
    });
  }
});

// Get specific stock details endpoint
app.get('/api/stocks/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const stockData = await dataAgent.ingestStockData();
    const stock = stockData.find(s => s.symbol === symbol);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock with symbol ${symbol} not found`
      });
    }
    
    const token = tokenizationAgent.getTokenizedStock(symbol);
    const insight = analyticsAgent.getInsight(symbol);
    
    res.json({
      success: true,
      data: {
        stock,
        token,
        insight
      }
    });
  } catch (error) {
    logger.error(`Error in /api/stocks/${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock details',
      error: (error as Error).message
    });
  }
});

// Start the server
const PORT = config.app.port;
app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // Initialize agents on startup if not in test mode
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv !== 'test') {
    try {
      await initializeAgents();
    } catch (error) {
      logger.error('Failed to initialize agents on startup:', error);
    }
  }
});

export default app; 
