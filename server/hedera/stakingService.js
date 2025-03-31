const {
  TransferTransaction,
  TokenAssociateTransaction,
  Client,
} = require("@hashgraph/sdk");

// Configure client connection
function getClient() {
  // Get operator from environment variables
  const operatorId = process.env.HEDERA_ACCOUNT_ID;
  const operatorKey = process.env.HEDERA_PRIVATE_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error(
      "Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present"
    );
  }

  // Create client connection
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  return client;
}

// In-memory store of staked tokens (in a production app, this would be in a database)
const stakedTokens = {
  /*
  Example structure:
  "accountId": {
    "tokenId": {
      amount: 100,
      startTimestamp: 1636540800000,
      apy: 5.2,
      releaseTimestamp: 1636540800000 + (30 * 24 * 60 * 60 * 1000) // 30 days later
    }
  }
  */
};

// Predefined staking pools with different APYs
const stakingPools = {
  short: { days: 7, apy: 3.5 },
  medium: { days: 30, apy: 5.2 },
  long: { days: 90, apy: 8.7 },
};

class StakingService {
  constructor() {
    this.client = getClient();
  }

  /**
   * Stake tokens for a specific duration
   * @param {string} tokenId - The token ID to stake
   * @param {string} accountId - The account staking the tokens
   * @param {number} amount - The amount of tokens to stake
   * @param {string} duration - The staking duration ("short", "medium", "long")
   * @returns {Promise<Object>} Staking details
   */
  async stakeTokens(tokenId, accountId, amount, duration) {
    try {
      // Validate duration
      if (!stakingPools[duration]) {
        throw new Error(
          `Invalid staking duration. Must be one of: ${Object.keys(
            stakingPools
          ).join(", ")}`
        );
      }

      // Get the pool details
      const pool = stakingPools[duration];
      const now = Date.now();
      const releaseTimestamp = now + pool.days * 24 * 60 * 60 * 1000;

      // In a real application, we would transfer the tokens to a staking contract or account
      // For this demo, we'll just record the stake in our in-memory store

      // Initialize account in staked tokens store if it doesn't exist
      if (!stakedTokens[accountId]) {
        stakedTokens[accountId] = {};
      }

      // Initialize token in account's staked tokens if it doesn't exist
      if (!stakedTokens[accountId][tokenId]) {
        stakedTokens[accountId][tokenId] = {
          amount: 0,
          stakes: [],
        };
      }

      // Add the new stake
      const stakeId = `stake-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const stake = {
        id: stakeId,
        amount: parseInt(amount),
        startTimestamp: now,
        apy: pool.apy,
        releaseTimestamp: releaseTimestamp,
        duration: pool.days,
        status: "active",
      };

      stakedTokens[accountId][tokenId].stakes.push(stake);
      stakedTokens[accountId][tokenId].amount += parseInt(amount);

      console.log(
        `Staked ${amount} of token ${tokenId} for account ${accountId} with APY ${pool.apy}% for ${pool.days} days`
      );

      return {
        stakeId,
        accountId,
        tokenId,
        amount: parseInt(amount),
        apy: pool.apy,
        startDate: new Date(now).toISOString(),
        releaseDate: new Date(releaseTimestamp).toISOString(),
        duration: pool.days,
        status: "active",
      };
    } catch (error) {
      console.error("Error during token staking:", error);
      throw error;
    }
  }

  /**
   * Unstake tokens and claim rewards
   * @param {string} stakeId - The ID of the stake to unstake
   * @param {string} accountId - The account that staked the tokens
   * @returns {Promise<Object>} Unstaking details
   */
  async unstakeTokens(stakeId, accountId) {
    try {
      // Find the stake
      let foundStake = null;
      let foundTokenId = null;

      // Look through all tokens staked by the account
      if (stakedTokens[accountId]) {
        for (const [tokenId, data] of Object.entries(stakedTokens[accountId])) {
          const stakeIndex = data.stakes.findIndex(
            (stake) => stake.id === stakeId
          );
          if (stakeIndex >= 0) {
            foundStake = data.stakes[stakeIndex];
            foundTokenId = tokenId;
            break;
          }
        }
      }

      if (!foundStake || !foundTokenId) {
        throw new Error(
          `Stake with ID ${stakeId} not found for account ${accountId}`
        );
      }

      // Check if the stake is still locked
      const now = Date.now();
      if (now < foundStake.releaseTimestamp) {
        const remainingTime = Math.ceil(
          (foundStake.releaseTimestamp - now) / (24 * 60 * 60 * 1000)
        );
        throw new Error(
          `Stake is still locked. ${remainingTime} days remaining.`
        );
      }

      // Calculate rewards
      const stakeDuration =
        (foundStake.releaseTimestamp - foundStake.startTimestamp) /
        (24 * 60 * 60 * 1000); // days
      const reward = Math.floor(
        foundStake.amount * (foundStake.apy / 100) * (stakeDuration / 365)
      );

      // Update stake status
      foundStake.status = "unstaked";
      stakedTokens[accountId][foundTokenId].amount -= foundStake.amount;

      console.log(
        `Unstaked ${foundStake.amount} of token ${foundTokenId} for account ${accountId} with reward ${reward}`
      );

      return {
        stakeId,
        accountId,
        tokenId: foundTokenId,
        amount: foundStake.amount,
        reward,
        totalReturned: foundStake.amount + reward,
        apy: foundStake.apy,
        duration: foundStake.duration,
        status: "unstaked",
      };
    } catch (error) {
      console.error("Error during token unstaking:", error);
      throw error;
    }
  }

  /**
   * Get all active stakes for an account
   * @param {string} accountId - The account ID
   * @returns {Promise<Array>} List of active stakes
   */
  async getActiveStakes(accountId) {
    try {
      const result = [];

      if (!stakedTokens[accountId]) {
        return result;
      }

      // Collect all active stakes across all tokens
      for (const [tokenId, data] of Object.entries(stakedTokens[accountId])) {
        for (const stake of data.stakes) {
          if (stake.status === "active") {
            const now = Date.now();
            const elapsedDays =
              (now - stake.startTimestamp) / (24 * 60 * 60 * 1000);
            const accruedReward = Math.floor(
              stake.amount * (stake.apy / 100) * (elapsedDays / 365)
            );

            result.push({
              stakeId: stake.id,
              accountId,
              tokenId,
              amount: stake.amount,
              currentReward: accruedReward,
              apy: stake.apy,
              startDate: new Date(stake.startTimestamp).toISOString(),
              releaseDate: new Date(stake.releaseTimestamp).toISOString(),
              duration: stake.duration,
              daysRemaining: Math.max(
                0,
                Math.ceil(
                  (stake.releaseTimestamp - now) / (24 * 60 * 60 * 1000)
                )
              ),
              isUnlocked: now >= stake.releaseTimestamp,
              status: stake.status,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error getting active stakes:", error);
      throw error;
    }
  }

  /**
   * Get available staking pools
   * @returns {Object} Staking pools information
   */
  getStakingPools() {
    return stakingPools;
  }
}

module.exports = new StakingService();
