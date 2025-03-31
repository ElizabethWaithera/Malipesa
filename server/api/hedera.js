const express = require("express");
const router = express.Router();
const hederaService = require("../hedera/hederaService");

// Create a new token for a stock
router.post("/create-token", async (req, res) => {
  try {
    const { stockSymbol, stockName } = req.body;
    const tokenId = await hederaService.createStockToken(
      stockSymbol,
      stockName
    );
    res.json({ success: true, tokenId });
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mint tokens
router.post("/mint", async (req, res) => {
  try {
    const { tokenId, amount, recipientAccountId } = req.body;
    const receipt = await hederaService.mintTokens(
      tokenId,
      amount,
      recipientAccountId
    );
    res.json({ success: true, receipt });
  } catch (error) {
    console.error("Error minting tokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transfer tokens
router.post("/transfer", async (req, res) => {
  try {
    const { tokenId, recipientAccountId, amount } = req.body;
    const receipt = await hederaService.transferTokens(
      tokenId,
      process.env.HEDERA_ACCOUNT_ID,
      recipientAccountId,
      amount
    );
    res.json({ success: true, receipt });
  } catch (error) {
    console.error("Error transferring tokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token balance
router.get("/balance/:tokenId/:accountId", async (req, res) => {
  try {
    const { tokenId, accountId } = req.params;
    const balance = await hederaService.getTokenBalance(tokenId, accountId);
    res.json({ success: true, balance });
  } catch (error) {
    console.error("Error getting token balance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
