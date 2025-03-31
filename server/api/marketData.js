// Market Data API for Hedera NSE Tokenization Platform
const express = require('express');
const router = express.Router();
const axios = require("axios");

// Mock NSE market data for demo purposes
const nseMarketData = {
  indices: {
    "NSE-20": { value: 1842.35, change: 0.65, changePercent: 1.2 },
    "NSE-25": { value: 3520.12, change: -10.25, changePercent: -0.3 },
    NASI: { value: 168.74, change: 1.28, changePercent: 0.8 },
    "NSE 20": { value: 1800.25, change: 1.2 },
    "NSE All Share": { value: 145.85, change: 0.8 },
  },
  stocks: {
    SCOM: {
      name: "Safaricom PLC",
      price: 25.3,
      change: 2.3,
      changePercent: 1.2,
      volume: 4826950,
      marketCap: 1013200000000, // ~1.01 Trillion KES
      pe: 14.2,
      dividend: 0.64,
      dividendYield: 2.5,
      sector: "Telecommunications",
      yearHigh: 33.45,
      yearLow: 24.0,
    },
    EQTY: {
      name: "Equity Group Holdings",
      price: 45.85,
      change: 1.8,
      changePercent: 0.3,
      volume: 1256780,
      marketCap: 172400000000, // ~172.4 Billion KES
      pe: 6.8,
      dividend: 3.3,
      dividendYield: 7.2,
      sector: "Banking",
      yearHigh: 52.25,
      yearLow: 38.15,
    },
    KCB: {
      name: "KCB Group PLC",
      price: 36.95,
      change: 1.2,
      changePercent: 0.3,
      volume: 876450,
      marketCap: 118700000000, // ~118.7 Billion KES
      pe: 4.2,
      dividend: 2.0,
      dividendYield: 5.4,
      sector: "Banking",
      yearHigh: 42.5,
      yearLow: 32.2,
    },
    COOP: {
      name: "Co-operative Bank of Kenya",
      price: 13.2,
      change: 0.8,
      changePercent: 0.8,
      volume: 1568920,
      marketCap: 77400000000, // ~77.4 Billion KES
      pe: 5.1,
      dividend: 1.0,
      dividendYield: 7.6,
      sector: "Banking",
      yearHigh: 15.75,
      yearLow: 11.5,
    },
    EABL: {
      name: "East African Breweries Ltd",
      price: 178.25,
      change: -0.5,
      changePercent: -0.3,
      volume: 325680,
      marketCap: 141600000000, // ~141.6 Billion KES
      pe: 17.3,
      dividend: 11.0,
      dividendYield: 6.2,
      sector: "Manufacturing",
      yearHigh: 189.5,
      yearLow: 145.25,
    },
    BAT: {
      name: "British American Tobacco Kenya",
      price: 475.25,
      change: 5.25,
      changePercent: 1.1,
      volume: 48750,
      marketCap: 47100000000, // ~47.1 Billion KES
      pe: 12.8,
      dividend: 50.0,
      dividendYield: 10.5,
      sector: "Manufacturing",
      yearHigh: 500.0,
      yearLow: 430.0,
    },
    BAMB: {
      name: "Bamburi Cement PLC",
      price: 42.5,
      change: 0.75,
      changePercent: 1.8,
      volume: 245890,
      marketCap: 15400000000, // ~15.4 Billion KES
      pe: 8.5,
      dividend: 3.0,
      dividendYield: 7.1,
      sector: "Manufacturing",
      yearHigh: 48.75,
      yearLow: 38.5,
    },
    KNRE: {
      name: "Kenya Re-Insurance Corporation",
      price: 2.45,
      change: -0.03,
      changePercent: -1.2,
      volume: 2568740,
      marketCap: 6800000000, // ~6.8 Billion KES
      pe: 3.5,
      dividend: 0.1,
      dividendYield: 4.1,
      sector: "Insurance",
      yearHigh: 2.9,
      yearLow: 2.3,
    },
    NCBA: {
      name: "NCBA Group PLC",
      price: 38.9,
      change: 2.1,
      changePercent: 0.8,
      volume: 386220,
      marketCap: 68700000000, // ~68.7 Billion KES
      pe: 5.5,
      dividend: 2.75,
      dividendYield: 6.6,
      sector: "Banking",
      yearHigh: 44.5,
      yearLow: 35.25,
    },
    SCBK: {
      name: "Standard Chartered Bank Kenya",
      price: 152.75,
      change: -0.5,
      changePercent: -0.3,
      volume: 78450,
      marketCap: 58100000000, // ~58.1 Billion KES
      pe: 9.2,
      dividend: 14.0,
      dividendYield: 9.2,
      sector: "Banking",
      yearHigh: 165.0,
      yearLow: 135.25,
    },
    ABSA: { name: "Absa Bank Kenya PLC", price: 12.85, change: 1.5 },
    BAMB: { name: "Bamburi Cement Ltd", price: 42.15, change: -1.2 },
  },
  sectors: {
    Banking: {
      performance: 2.3,
      outlook: "Positive",
      stocks: ["EQTY", "KCB", "COOP", "NCBA", "SCBK"],
      marketCap: 495300000000, // ~495.3 Billion KES
      averagePE: 6.2,
      averageDividendYield: 7.2,
    },
    Telecommunications: {
      performance: 1.1,
      outlook: "Stable",
      stocks: ["SCOM"],
      marketCap: 1013200000000, // ~1.01 Trillion KES
      averagePE: 14.2,
      averageDividendYield: 2.5,
    },
    Manufacturing: {
      performance: -0.5,
      outlook: "Neutral",
      stocks: ["EABL", "BAT", "BAMB"],
      marketCap: 204100000000, // ~204.1 Billion KES
      averagePE: 12.9,
      averageDividendYield: 7.9,
    },
    Insurance: {
      performance: 0.3,
      outlook: "Stable",
      stocks: ["KNRE"],
      marketCap: 6800000000, // ~6.8 Billion KES
      averagePE: 3.5,
      averageDividendYield: 4.1,
    },
  },
  marketNews: [
    {
      title: "NSE turnover rises as foreign investors return",
      date: "2023-12-01",
      summary:
        "Trading at the Nairobi Securities Exchange (NSE) increased significantly as foreign investors returned to the market, focusing on blue-chip stocks like Safaricom and Equity Group.",
    },
    {
      title: "Banking sector leads NSE gains on strong Q3 earnings",
      date: "2023-11-28",
      summary:
        "Kenyan banking stocks have shown strong performance following impressive third-quarter results, with KCB Group and Equity Group leading the gains.",
    },
    {
      title: "Central Bank holds key interest rate at 12.5%",
      date: "2023-11-25",
      summary:
        "The Central Bank of Kenya maintained its benchmark interest rate at 12.5% as inflation showed signs of stabilizing, providing relief to the stock market.",
    },
    {
      title: "Safaricom expands 5G network in major Kenyan cities",
      date: "2023-11-20",
      summary:
        "Safaricom has announced the expansion of its 5G network to cover more areas in Nairobi, Mombasa, and Kisumu, potentially driving future revenue growth.",
    },
  ],
};

// Get market overview
router.get("/overview", (req, res) => {
  const { indices, marketNews } = nseMarketData;

  // Calculate market statistics
  const topGainers = Object.entries(nseMarketData.stocks)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = Object.entries(nseMarketData.stocks)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const mostActive = Object.entries(nseMarketData.stocks)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  res.json({
    indices,
    topGainers,
    topLosers,
    mostActive,
    marketNews,
    timestamp: new Date().toISOString(),
  });
});

// Get stock details
router.get("/stock/:symbol", (req, res) => {
  const { symbol } = req.params;
  const stock = nseMarketData.stocks[symbol.toUpperCase()];

  if (!stock) {
    return res.status(404).json({ error: `Stock ${symbol} not found` });
  }

  // Get sector information for the stock
  const sectorInfo = Object.entries(nseMarketData.sectors).find(([_, data]) =>
    data.stocks.includes(symbol.toUpperCase())
  );

  const sector = sectorInfo
    ? {
        name: sectorInfo[0],
        ...sectorInfo[1],
      }
    : null;

  res.json({
    symbol: symbol.toUpperCase(),
    ...stock,
    sector,
    timestamp: new Date().toISOString(),
  });
});

// Get sector information
router.get("/sectors", (req, res) => {
  res.json({
    sectors: nseMarketData.sectors,
    timestamp: new Date().toISOString(),
  });
});

// Add endpoint for market news
router.get("/news", async (req, res) => {
  try {
    const news = getFallbackNews();
    res.json({
      news,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error handling market news request:", error);
    res.status(500).json({ error: "Failed to fetch market news" });
  }
});

// Market data endpoints
router.get("/stocks", (req, res) => {
  res.json(nseMarketData.stocks);
});

router.get("/indices", (req, res) => {
  res.json(nseMarketData.indices);
});

module.exports = router; 
