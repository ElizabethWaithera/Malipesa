// AI Advisor API Endpoint for Hedera NSE Tokenization Platform
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();
require('dotenv').config();

// Log API key presence (not the actual key for security)
console.log(`OpenAI API Key exists: ${!!process.env.OPENAI_API_KEY}`);
console.log(`OpenAI API Key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);
console.log(`OpenAI API Key starts with: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 9) : 'N/A'}`);

// Initialize OpenAI with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow keys starting with sk-proj
});

// Market data for Kenyan stocks (used to enhance responses)
const marketData = {
  indices: {
    "NSE-20": { value: 1842.35, change: 0.65, changePercent: 1.2 },
    "NSE-25": { value: 3520.12, change: -10.25, changePercent: -0.3 },
    NASI: { value: 168.74, change: 1.28, changePercent: 0.8 },
  },
  stocks: {
    SCOM: {
      name: "Safaricom PLC",
      price: 25.3,
      change: 0.3,
      changePercent: 1.2,
      marketCap: 1013200000000, // ~1.01 Trillion KES
      pe: 14.2,
      dividend: 0.64,
      dividendYield: 2.5,
      sector: "Telecommunications",
      news: [
        "Safaricom Ethiopia subscriber numbers reach 5 million",
        "M-Pesa revenue grew by 18.3% in the last quarter",
        "Planning 5G expansion in major Kenyan cities",
      ],
    },
    EQTY: {
      name: "Equity Group Holdings",
      price: 45.85,
      change: -0.15,
      changePercent: -0.3,
      marketCap: 172400000000, // ~172.4 Billion KES
      pe: 6.8,
      dividend: 3.3,
      dividendYield: 7.2,
      sector: "Banking",
      news: [
        "Reported 30% profit growth in latest quarterly results",
        "Expanding digital banking services across East Africa",
        "Introducing new SME financing options",
      ],
    },
    KCB: {
      name: "KCB Group PLC",
      price: 36.95,
      change: 0.45,
      changePercent: 1.2,
      marketCap: 118700000000, // ~118.7 Billion KES
      pe: 4.2,
      dividend: 2.0,
      dividendYield: 5.4,
      sector: "Banking",
      news: [
        "Completed acquisition of Trust Merchant Bank in DRC",
        "Launched new mobile banking platform",
        "Green bonds initiative to support climate-friendly projects",
      ],
    },
    COOP: {
      name: "Co-operative Bank of Kenya",
      price: 13.2,
      change: 0.1,
      changePercent: 0.8,
      marketCap: 77400000000, // ~77.4 Billion KES
      pe: 5.1,
      dividend: 1.0,
      dividendYield: 7.6,
      sector: "Banking",
      news: [
        "Increasing focus on MSME lending",
        "Digital transformation strategy yielding positive results",
        "Growth in non-interest income through banking services",
      ],
    },
    EABL: {
      name: "East African Breweries Ltd",
      price: 178.25,
      change: -1.75,
      changePercent: -1.0,
      marketCap: 141600000000, // ~141.6 Billion KES
      pe: 17.3,
      dividend: 11.0,
      dividendYield: 6.2,
      sector: "Manufacturing",
      news: [
        "Launch of new premium beer targeting younger market",
        "Sustainability initiatives reducing water usage",
        "Expanding production capacity in Kisumu",
      ],
    },
    BAT: {
      name: "British American Tobacco Kenya",
      price: 475.25,
      change: 5.25,
      changePercent: 1.1,
      marketCap: 47100000000, // ~47.1 Billion KES
      pe: 12.8,
      dividend: 50.0,
      dividendYield: 10.5,
      sector: "Manufacturing",
      news: [
        "Dividend policy maintained despite regulatory challenges",
        "Diversifying into alternative nicotine products",
        "Export market expansion mitigating local market challenges",
      ],
    },
    BAMB: {
      name: "Bamburi Cement PLC",
      price: 42.5,
      change: 0.75,
      changePercent: 1.8,
      marketCap: 15400000000, // ~15.4 Billion KES
      pe: 8.5,
      dividend: 3.0,
      dividendYield: 7.1,
      sector: "Manufacturing",
      news: [
        "Growth in construction sector boosting cement demand",
        "Introducing eco-friendly cement products",
        "Cost-reduction initiatives improving margins",
      ],
    },
    KNRE: {
      name: "Kenya Re-Insurance Corporation",
      price: 2.45,
      change: -0.03,
      changePercent: -1.2,
      marketCap: 6800000000, // ~6.8 Billion KES
      pe: 3.5,
      dividend: 0.1,
      dividendYield: 4.1,
      sector: "Insurance",
      news: [
        "Expanding presence in regional markets",
        "New retakaful strategy showing promising results",
        "Digital transformation enhancing operational efficiency",
      ],
    },
    NCBA: {
      name: "NCBA Group PLC",
      price: 24.9,
      change: -0.9,
      changePercent: -3.5,
      marketCap: 41500000000, // ~41.5 Billion KES
      pe: 5.3,
      dividend: 1.75,
      dividendYield: 7.0,
      sector: "Banking",
      news: [
        "Digital banking initiatives driving customer acquisition",
        "Regional expansion in Tanzania showing promising results",
        "New partnership with mobile operators for loan products",
      ],
    },
    SCBK: {
      name: "Standard Chartered Bank Kenya",
      price: 152.75,
      change: -0.5,
      changePercent: -0.3,
      marketCap: 58100000000, // ~58.1 Billion KES
      pe: 9.2,
      dividend: 14.0,
      dividendYield: 9.2,
      sector: "Banking",
      news: [
        "Digital banking transformation accelerating",
        "SME lending portfolio growing by 12% year-on-year",
        "New sustainable finance initiatives launched",
      ],
    },
    ABSA: {
      name: "ABSA Bank Kenya",
      price: 12.05,
      change: 0.15,
      changePercent: 1.3,
      marketCap: 65300000000, // ~65.3 Billion KES
      pe: 4.8,
      dividend: 1.1,
      dividendYield: 9.1,
      sector: "Banking",
      news: [
        "Rebranding from Barclays to Absa completed successfully",
        "New digital banking platform showing strong customer adoption",
        "SME lending initiative launched with KES 10 billion facility",
      ],
    },
  },
  sectors: {
    Banking: { performance: 2.3, outlook: "Positive" },
    Telecommunications: { performance: 1.1, outlook: "Stable" },
    Manufacturing: { performance: -0.5, outlook: "Neutral" },
    Energy: { performance: -1.2, outlook: "Neutral" },
    Insurance: { performance: 0.3, outlook: "Stable" },
  },
  economicFactors: {
    Inflation: {
      value: 6.8,
      trend: "Decreasing",
      impact: "Moderately negative",
    },
    InterestRate: { value: 12.5, trend: "Stable", impact: "Neutral" },
    GDPGrowth: { value: 4.9, trend: "Increasing", impact: "Positive" },
    ExchangeRate: { value: 128.5, trend: "Depreciating", impact: "Mixed" },
  },
};

// Route to handle AI financial advisor requests
router.post("/", async (req, res) => {
  try {
    const { message, user, portfolio, timestamp } = req.body;

    // Format stock holdings for better context
    const formattedPortfolio = {
      cash: `KES ${portfolio.cash.toLocaleString()}`,
      stocks: portfolio.stocks.map((stock) => {
        const marketInfo = marketData.stocks[stock.symbol] || {};
        const currentValue = stock.shares * stock.currentPrice;
        const percentChange = (
          ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) *
          100
        ).toFixed(2);

        return {
          symbol: stock.symbol,
          name: stock.name,
          shares: stock.shares,
          avgPrice: `KES ${stock.avgPrice.toFixed(2)}`,
          currentPrice: `KES ${stock.currentPrice.toFixed(2)}`,
          value: `KES ${currentValue.toLocaleString()}`,
          percentChange: `${percentChange}%`,
          performance: parseFloat(percentChange) >= 0 ? "Gaining" : "Declining",
        };
      }),
    };

    // Create system message with comprehensive context
    const systemMessage = `
You are a financial advisor for the Nairobi Securities Exchange (NSE) in Kenya.
You're assisting ${user.name}, a ${user.type} with account ID ${user.account}.

EXACT PORTFOLIO:
- Cash: ${formattedPortfolio.cash}
- Total Stocks: ${portfolio.stocks.length}
- Holdings: ${portfolio.stocks
      .map((s) => `${s.shares} ${s.symbol} @ KES ${s.currentPrice}`)
      .join(", ")}

MARKET INFO:
- NSE-20 Index: ${marketData.indices["NSE-20"].value} (${
      marketData.indices["NSE-20"].changePercent
    }% today)
- Inflation: ${marketData.economicFactors["Inflation"].value}%

RESPONSE RULES:
1. Be EXTREMELY CONCISE (30-50 words maximum)
2. ONLY discuss stocks actually in the user's portfolio
3. Use KES for all monetary values
4. NEVER mention stocks not in their portfolio
5. Always provide accurate numbers reflecting their EXACT holdings
6. Focus purely on Kenyan market context

Answer directly and accurately.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // More efficient model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
      temperature: 0.3, // Lower temperature for more accurate/predictable responses
      max_tokens: 100, // Limit token usage for faster responses
    });

    const aiResponse = completion.choices[0].message.content;

    // Store the conversation in your database here if needed

    // Return the AI response
    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(2, 15),
    });
  } catch (error) {
    console.error("Error processing AI advisor request:", error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Add a chat route for handling user messages
router.post("/chat", async (req, res) => {
  try {
    console.log("Received chat request:", req.body);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return res.status(500).json({
        error: "OpenAI API key is not configured",
        message:
          "The AI assistant is currently unavailable. Please try again later.",
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL_NAME || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful financial advisor for the Nairobi Securities Exchange.",
          },
          { role: "user", content: message },
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || 1000),
      });

      console.log("OpenAI response received");

      if (
        completion.choices &&
        completion.choices.length > 0 &&
        completion.choices[0].message
      ) {
        return res.json({ message: completion.choices[0].message.content });
      } else {
        console.error("Unexpected OpenAI response format");
        return res.status(500).json({
          error: "Unexpected response format",
          message: "The AI assistant encountered an issue. Please try again.",
        });
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError.name, openaiError.message);
      if (openaiError.name === "AuthenticationError") {
        console.error("This is likely an API key format or validity issue");
      }
      return res.status(500).json({
        error: openaiError.message,
        message: "The AI assistant encountered an issue. Please try again.",
      });
    }
  } catch (error) {
    console.error("Server error in chat handler:", error);
    res.status(500).json({
      error: error.message,
      message: "An unexpected error occurred. Please try again.",
    });
  }
});

module.exports = router; 
