import { StockData } from './types';

/**
 * Generate synthetic NSE stock data for demonstration purposes
 * @returns Array of synthetic stock data
 */
export function generateSyntheticStockData(): StockData[] {
  // List of synthetic NSE stocks with realistic data
  const stocks: StockData[] = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      lastPrice: 2567.45,
      previousClose: 2545.30,
      percentChange: 0.87,
      volume: 3245678,
      marketCap: 1734560000000,
      yearHigh: 2855.75,
      yearLow: 2100.50,
      industry: 'Oil & Gas',
      sector: 'Energy',
      dividendYield: 0.42,
      timestamp: new Date()
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd.',
      lastPrice: 3432.15,
      previousClose: 3467.80,
      percentChange: -1.03,
      volume: 1345983,
      marketCap: 1258900000000,
      yearHigh: 3660.25,
      yearLow: 3100.40,
      industry: 'IT Services',
      sector: 'Technology',
      dividendYield: 1.35,
      timestamp: new Date()
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      lastPrice: 1678.50,
      previousClose: 1665.75,
      percentChange: 0.76,
      volume: 2567890,
      marketCap: 934560000000,
      yearHigh: 1780.45,
      yearLow: 1450.60,
      industry: 'Banking',
      sector: 'Financial Services',
      dividendYield: 0.89,
      timestamp: new Date()
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      lastPrice: 1432.25,
      previousClose: 1456.75,
      percentChange: -1.68,
      volume: 1876543,
      marketCap: 601230000000,
      yearHigh: 1590.85,
      yearLow: 1310.30,
      industry: 'IT Services',
      sector: 'Technology',
      dividendYield: 2.15,
      timestamp: new Date()
    },
    {
      symbol: 'HINDUNILVR',
      name: 'Hindustan Unilever Ltd.',
      lastPrice: 2564.30,
      previousClose: 2545.60,
      percentChange: 0.73,
      volume: 876543,
      marketCap: 602340000000,
      yearHigh: 2750.45,
      yearLow: 2345.70,
      industry: 'FMCG',
      sector: 'Consumer Staples',
      dividendYield: 1.56,
      timestamp: new Date()
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd.',
      lastPrice: 876.45,
      previousClose: 865.30,
      percentChange: 1.29,
      volume: 1654321,
      marketCap: 495670000000,
      yearHigh: 910.75,
      yearLow: 690.45,
      industry: 'Telecommunications',
      sector: 'Communication Services',
      dividendYield: 0.65,
      timestamp: new Date()
    },
    {
      symbol: 'ITC',
      name: 'ITC Ltd.',
      lastPrice: 432.75,
      previousClose: 425.45,
      percentChange: 1.72,
      volume: 3456789,
      marketCap: 538970000000,
      yearHigh: 450.85,
      yearLow: 320.45,
      industry: 'FMCG',
      sector: 'Consumer Staples',
      dividendYield: 3.45,
      timestamp: new Date()
    },
    {
      symbol: 'KOTAKBANK',
      name: 'Kotak Mahindra Bank Ltd.',
      lastPrice: 1876.35,
      previousClose: 1890.45,
      percentChange: -0.75,
      volume: 987654,
      marketCap: 371240000000,
      yearHigh: 2010.35,
      yearLow: 1650.45,
      industry: 'Banking',
      sector: 'Financial Services',
      dividendYield: 0.67,
      timestamp: new Date()
    },
    {
      symbol: 'MARUTI',
      name: 'Maruti Suzuki India Ltd.',
      lastPrice: 9876.50,
      previousClose: 9765.75,
      percentChange: 1.13,
      volume: 345678,
      marketCap: 298760000000,
      yearHigh: 10245.65,
      yearLow: 8450.35,
      industry: 'Automobiles',
      sector: 'Consumer Discretionary',
      dividendYield: 0.85,
      timestamp: new Date()
    },
    {
      symbol: 'AXISBANK',
      name: 'Axis Bank Ltd.',
      lastPrice: 978.45,
      previousClose: 985.60,
      percentChange: -0.73,
      volume: 1234567,
      marketCap: 301450000000,
      yearHigh: 1050.75,
      yearLow: 850.45,
      industry: 'Banking',
      sector: 'Financial Services',
      dividendYield: 0.78,
      timestamp: new Date()
    },
    {
      symbol: 'TATASTEEL',
      name: 'Tata Steel Ltd.',
      lastPrice: 132.45,
      previousClose: 129.35,
      percentChange: 2.40,
      volume: 5634521,
      marketCap: 161950000000,
      yearHigh: 145.85,
      yearLow: 95.40,
      industry: 'Steel',
      sector: 'Materials',
      dividendYield: 2.35,
      timestamp: new Date()
    },
    {
      symbol: 'WIPRO',
      name: 'Wipro Ltd.',
      lastPrice: 432.60,
      previousClose: 435.75,
      percentChange: -0.72,
      volume: 1543210,
      marketCap: 236780000000,
      yearHigh: 465.30,
      yearLow: 385.45,
      industry: 'IT Services',
      sector: 'Technology',
      dividendYield: 1.85,
      timestamp: new Date()
    },
    {
      symbol: 'SUNPHARMA',
      name: 'Sun Pharmaceutical Industries Ltd.',
      lastPrice: 1089.75,
      previousClose: 1076.45,
      percentChange: 1.24,
      volume: 876432,
      marketCap: 261430000000,
      yearHigh: 1150.85,
      yearLow: 950.40,
      industry: 'Pharmaceuticals',
      sector: 'Healthcare',
      dividendYield: 0.95,
      timestamp: new Date()
    },
    {
      symbol: 'ASIANPAINT',
      name: 'Asian Paints Ltd.',
      lastPrice: 3245.65,
      previousClose: 3289.75,
      percentChange: -1.34,
      volume: 432156,
      marketCap: 311290000000,
      yearHigh: 3450.75,
      yearLow: 2900.45,
      industry: 'Paints',
      sector: 'Materials',
      dividendYield: 0.76,
      timestamp: new Date()
    },
    {
      symbol: 'HCLTECH',
      name: 'HCL Technologies Ltd.',
      lastPrice: 1245.35,
      previousClose: 1232.65,
      percentChange: 1.03,
      volume: 987632,
      marketCap: 337980000000,
      yearHigh: 1320.45,
      yearLow: 1050.35,
      industry: 'IT Services',
      sector: 'Technology',
      dividendYield: 1.65,
      timestamp: new Date()
    },
    {
      symbol: 'BAJFINANCE',
      name: 'Bajaj Finance Ltd.',
      lastPrice: 6789.45,
      previousClose: 6890.75,
      percentChange: -1.47,
      volume: 654321,
      marketCap: 409870000000,
      yearHigh: 7450.85,
      yearLow: 5890.45,
      industry: 'Finance',
      sector: 'Financial Services',
      dividendYield: 0.56,
      timestamp: new Date()
    },
    {
      symbol: 'LT',
      name: 'Larsen & Toubro Ltd.',
      lastPrice: 2576.85,
      previousClose: 2545.65,
      percentChange: 1.23,
      volume: 765432,
      marketCap: 361930000000,
      yearHigh: 2650.75,
      yearLow: 2100.45,
      industry: 'Construction',
      sector: 'Industrials',
      dividendYield: 1.25,
      timestamp: new Date()
    },
    {
      symbol: 'NTPC',
      name: 'NTPC Ltd.',
      lastPrice: 245.65,
      previousClose: 241.35,
      percentChange: 1.78,
      volume: 2345678,
      marketCap: 237890000000,
      yearHigh: 255.85,
      yearLow: 195.40,
      industry: 'Power Generation',
      sector: 'Utilities',
      dividendYield: 3.75,
      timestamp: new Date()
    },
    {
      symbol: 'ONGC',
      name: 'Oil and Natural Gas Corporation Ltd.',
      lastPrice: 187.45,
      previousClose: 185.60,
      percentChange: 1.00,
      volume: 1876543,
      marketCap: 235680000000,
      yearHigh: 210.75,
      yearLow: 160.45,
      industry: 'Oil & Gas',
      sector: 'Energy',
      dividendYield: 4.25,
      timestamp: new Date()
    },
    {
      symbol: 'POWERGRID',
      name: 'Power Grid Corporation of India Ltd.',
      lastPrice: 235.75,
      previousClose: 231.45,
      percentChange: 1.86,
      volume: 1345678,
      marketCap: 219450000000,
      yearHigh: 245.85,
      yearLow: 195.45,
      industry: 'Power Transmission',
      sector: 'Utilities',
      dividendYield: 4.15,
      timestamp: new Date()
    }
  ];

  return stocks;
}

/**
 * Generate updated price data for synthetic stocks
 * Simulates random market movements
 * @param stocks The original stock data
 * @returns Updated stock data
 */
export function updateSyntheticStockPrices(stocks: StockData[]): StockData[] {
  return stocks.map(stock => {
    // Generate random price movement (-2% to +2%)
    const priceChange = (Math.random() * 4 - 2) / 100;
    const previousClose = stock.lastPrice;
    const newPrice = previousClose * (1 + priceChange);
    
    return {
      ...stock,
      previousClose,
      lastPrice: parseFloat(newPrice.toFixed(2)),
      percentChange: parseFloat((priceChange * 100).toFixed(2)),
      timestamp: new Date()
    };
  });
} 
