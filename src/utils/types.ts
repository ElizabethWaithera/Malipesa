// NSE Stock Data Types
export interface StockData {
  symbol: string;
  name: string;
  lastPrice: number;
  previousClose: number;
  percentChange: number;
  volume: number;
  marketCap: number;
  yearHigh: number;
  yearLow: number;
  industry: string;
  sector: string;
  dividendYield: number;
  timestamp: Date;
}

// Tokenized Stock Data Types
export interface TokenizedStock {
  symbol: string;
  name: string;
  tokenId: string;
  contractId: string;
  supply: number;
  value: number;
  metadata: string;
  lastUpdate: Date;
}

export interface StockMetadata {
  description?: string;
  industry?: string;
  sector?: string;
  dividendYield?: number;
  eps?: number; // Earnings Per Share
  bookValue?: number;
  website?: string;
}

export interface TokenHistory {
  timestamp: Date;
  value: number;
  action: 'CREATE' | 'TRANSFER' | 'BURN' | 'UPDATE';
  from?: string;
  to?: string;
  transactionId?: string;
}

// Analytics Types
export interface AnalyticsInsight {
  symbol: string;
  tokenId: string;
  sentiment: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  factors: string[];
  prediction: {
    shortTerm: PricePrediction;
    mediumTerm: PricePrediction;
    longTerm: PricePrediction;
  };
  timestamp: Date;
}

export interface PricePrediction {
  timeframe: string;
  expectedPrice: number;
  percentChange: number;
  confidence: number;
}

// Agent Types
export interface AgentConfig {
  name: string;
  version: string;
  enabled: boolean;
  intervalMs?: number;
  settings: Record<string, any>;
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  timestamp: Date;
  processingTimeMs: number;
}

// Token transfer requests and results
export interface TokenTransferRequest {
  fromUser: string;
  toUser: string;
  symbol: string;
  amount: number;
  tokenId?: string;
}

export interface TokenTransferResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  from: string;
  to: string;
  symbol: string;
  amount: number;
  value: number;
  timestamp: Date;
} 
