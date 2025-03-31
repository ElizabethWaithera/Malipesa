const express = require("express");
const router = express.Router();
const stakingService = require("../hedera/stakingService");

/**
 * GET /api/staking/pools
 * Get available staking pools
 */
router.get("/pools", (req, res) => {
  try {
    const pools = stakingService.getStakingPools();

    res.json({
      success: true,
      data: pools,
    });
  } catch (error) {
    console.error("Error getting staking pools:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get staking pools",
    });
  }
});

/**
 * GET /api/staking/active
 * Get active stakes for an account
 */
router.get("/active", async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: "Account ID is required",
      });
    }

    const activeStakes = await stakingService.getActiveStakes(accountId);

    res.json({
      success: true,
      data: activeStakes,
    });
  } catch (error) {
    console.error("Error getting active stakes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active stakes",
    });
  }
});

/**
 * POST /api/staking/stake
 * Stake tokens
 */
router.post("/stake", async (req, res) => {
  try {
    const { tokenId, accountId, amount, duration } = req.body;

    // Validate required fields
    if (!tokenId || !accountId || !amount || !duration) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for staking",
      });
    }

    // Execute the staking
    const result = await stakingService.stakeTokens(
      tokenId,
      accountId,
      amount,
      duration
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully staked ${amount} tokens with ${result.apy}% APY for ${result.duration} days`,
    });
  } catch (error) {
    console.error("Error staking tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to stake tokens",
    });
  }
});

/**
 * POST /api/staking/unstake
 * Unstake tokens and claim rewards
 */
router.post("/unstake", async (req, res) => {
  try {
    const { stakeId, accountId } = req.body;

    // Validate required fields
    if (!stakeId || !accountId) {
      return res.status(400).json({
        success: false,
        error: "Both stakeId and accountId are required",
      });
    }

    // Execute the unstaking
    const result = await stakingService.unstakeTokens(stakeId, accountId);

    res.json({
      success: true,
      data: result,
      message: `Successfully unstaked ${result.amount} tokens with reward of ${result.reward} tokens`,
    });
  } catch (error) {
    console.error("Error unstaking tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to unstake tokens",
    });
  }
});

module.exports = router;
