import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const config = {
  // General app configuration
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  // Hedera network configuration
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID || '',
    privateKey: process.env.HEDERA_PRIVATE_KEY || '',
    operatorId: process.env.HEDERA_OPERATOR_ID || '',
    operatorKey: process.env.HEDERA_OPERATOR_KEY || '',
  },
  
  // NSE data configuration
  nseData: {
    apiUrl: process.env.NSE_API_URL || 'https://api.example.com/nse',
    apiKey: process.env.NSE_API_KEY || '',
    refreshInterval: parseInt(process.env.DATA_REFRESH_INTERVAL || '60000', 10), // Default 1 minute
  },
  
  // AI configuration
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
  },
  
  // Paths
  paths: {
    root: path.resolve(__dirname, '../../'),
    contracts: path.resolve(__dirname, '../../contracts'),
    data: path.resolve(__dirname, '../../data'),
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hedera-ai-toolkit',
  },
};

export default config; 
