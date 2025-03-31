const express = require("express");
const router = express.Router();
const swapService = require("../hedera/swapService");

/**
 * GET /api/swap/rate
 * Get exchange rate between two tokens
 */
router.get("/rate", async (req, res) => {
  try {
    const { fromToken, toToken } = req.query;

    if (!fromToken || !toToken) {
      return res.status(400).json({
        success: false,
        error: "Both fromToken and toToken parameters are required",
      });
    }

    const exchangeRate = await swapService.getExchangeRate(fromToken, toToken);

    res.json({
      success: true,
      data: exchangeRate,
    });
  } catch (error) {
    console.error("Error getting exchange rate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get exchange rate",
    });
  }
});

/**
 * POST /api/swap/token
 * Swap between two tokens
 */
router.post("/token", async (req, res) => {
  try {
    const {
      fromTokenId,
      toTokenId,
      fromAccountId,
      toAccountId,
      fromAmount,
      toAmount,
    } = req.body;

    // Validate required fields
    if (
      !fromTokenId ||
      !toTokenId ||
      !fromAccountId ||
      !toAccountId ||
      !fromAmount ||
      !toAmount
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for token swap",
      });
    }

    // Execute the token swap
    const transactionId = await swapService.swapTokens(
      fromTokenId,
      toTokenId,
      fromAccountId,
      toAccountId,
      parseInt(fromAmount),
      parseInt(toAmount)
    );

    res.json({
      success: true,
      transactionId,
      message: `Successfully swapped ${fromAmount} of ${fromTokenId} for ${toAmount} of ${toTokenId}`,
    });
  } catch (error) {
    console.error("Error executing token swap:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute token swap",
    });
  }
});

/**
 * POST /api/swap/hbar
 * Swap tokens for HBAR
 */
router.post("/hbar", async (req, res) => {
  try {
    const { tokenId, accountId, tokenAmount, hbarAmount, counterpartyId } =
      req.body;

    // Validate required fields
    if (
      !tokenId ||
      !accountId ||
      !tokenAmount ||
      !hbarAmount ||
      !counterpartyId
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for token-HBAR swap",
      });
    }

    // Execute the token-HBAR swap
    const transactionId = await swapService.swapTokenForHbar(
      tokenId,
      accountId,
      parseInt(tokenAmount),
      parseFloat(hbarAmount),
      counterpartyId
    );

    res.json({
      success: true,
      transactionId,
      message: `Successfully swapped ${tokenAmount} of ${tokenId} for ${hbarAmount} HBAR`,
    });
  } catch (error) {
    console.error("Error executing token-HBAR swap:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute token-HBAR swap",
    });
  }
});

module.exports = router;
