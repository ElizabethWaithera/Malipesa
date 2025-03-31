const {
  TokenCreateTransaction,
  TransferTransaction,
  TokenType,
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

// In-memory store of marketplace listings (in a production app, this would be in a database)
const marketplaceListings = [];

class MarketplaceService {
  constructor() {
    this.client = getClient();
  }

  /**
   * Create a new marketplace listing for a token
   * @param {string} tokenId - The token ID
   * @param {string} sellerAccountId - The seller's account ID
   * @param {number} amount - The amount of tokens to sell
   * @param {number} pricePerToken - The price per token in KES
   * @returns {Promise<Object>} Listing details
   */
  async createListing(tokenId, sellerAccountId, amount, pricePerToken) {
    try {
      const listingId = `listing-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      const timestamp = Date.now();

      // Create the listing
      const listing = {
        id: listingId,
        tokenId,
        sellerAccountId,
        amount: parseInt(amount),
        available: parseInt(amount),
        pricePerToken: parseFloat(pricePerToken),
        totalValue: parseInt(amount) * parseFloat(pricePerToken),
        createdAt: timestamp,
        updatedAt: timestamp,
        status: "active",
      };

      // Add to listings
      marketplaceListings.push(listing);

      console.log(
        `Created listing ${listingId} for ${amount} of token ${tokenId} at ${pricePerToken} KES per token`
      );

      return listing;
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      throw error;
    }
  }

  /**
   * Buy tokens from a marketplace listing
   * @param {string} listingId - The listing ID
   * @param {string} buyerAccountId - The buyer's account ID
   * @param {number} amount - The amount of tokens to buy
   * @returns {Promise<Object>} Purchase details
   */
  async purchaseTokens(listingId, buyerAccountId, amount) {
    try {
      // Find the listing
      const listingIndex = marketplaceListings.findIndex(
        (listing) => listing.id === listingId
      );

      if (listingIndex === -1) {
        throw new Error(`Listing with ID ${listingId} not found`);
      }

      const listing = marketplaceListings[listingIndex];

      // Check if listing is active
      if (listing.status !== "active") {
        throw new Error(`Listing with ID ${listingId} is not active`);
      }

      // Check if enough tokens are available
      if (listing.available < amount) {
        throw new Error(
          `Listing only has ${listing.available} tokens available, requested ${amount}`
        );
      }

      // Calculate purchase details
      const purchaseAmount = parseInt(amount);
      const totalPrice = purchaseAmount * listing.pricePerToken;
      const purchaseId = `purchase-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // In a real application, we would execute a Hedera token transfer here
      // For this demo, we'll just update our in-memory store

      // Update listing available amount
      listing.available -= purchaseAmount;
      listing.updatedAt = Date.now();

      // If no more tokens are available, mark listing as completed
      if (listing.available === 0) {
        listing.status = "completed";
      }

      // Update the listing in the array
      marketplaceListings[listingIndex] = listing;

      console.log(
        `Purchased ${purchaseAmount} tokens from listing ${listingId} for ${totalPrice} KES`
      );

      // Return purchase details
      return {
        purchaseId,
        listingId,
        tokenId: listing.tokenId,
        sellerAccountId: listing.sellerAccountId,
        buyerAccountId,
        amount: purchaseAmount,
        pricePerToken: listing.pricePerToken,
        totalPrice,
        timestamp: Date.now(),
        status: "completed",
      };
    } catch (error) {
      console.error("Error purchasing tokens:", error);
      throw error;
    }
  }

  /**
   * Cancel a marketplace listing
   * @param {string} listingId - The listing ID
   * @param {string} accountId - The account ID (must be the seller)
   * @returns {Promise<Object>} Cancellation details
   */
  async cancelListing(listingId, accountId) {
    try {
      // Find the listing
      const listingIndex = marketplaceListings.findIndex(
        (listing) => listing.id === listingId
      );

      if (listingIndex === -1) {
        throw new Error(`Listing with ID ${listingId} not found`);
      }

      const listing = marketplaceListings[listingIndex];

      // Check if the account is the seller
      if (listing.sellerAccountId !== accountId) {
        throw new Error(`Only the seller can cancel this listing`);
      }

      // Check if listing is already completed or cancelled
      if (listing.status !== "active") {
        throw new Error(
          `Listing with ID ${listingId} is already ${listing.status}`
        );
      }

      // Update listing status
      listing.status = "cancelled";
      listing.updatedAt = Date.now();

      // Update the listing in the array
      marketplaceListings[listingIndex] = listing;

      console.log(`Cancelled listing ${listingId}`);

      return {
        listingId,
        tokenId: listing.tokenId,
        sellerAccountId: listing.sellerAccountId,
        remainingAmount: listing.available,
        status: "cancelled",
        cancelledAt: Date.now(),
      };
    } catch (error) {
      console.error("Error cancelling listing:", error);
      throw error;
    }
  }

  /**
   * Get all marketplace listings
   * @param {Object} filters - Optional filters for listings
   * @returns {Promise<Array>} List of marketplace listings
   */
  async getListings(filters = {}) {
    try {
      let filteredListings = [...marketplaceListings];

      // Apply filters if provided
      if (filters.status) {
        filteredListings = filteredListings.filter(
          (listing) => listing.status === filters.status
        );
      }

      if (filters.tokenId) {
        filteredListings = filteredListings.filter(
          (listing) => listing.tokenId === filters.tokenId
        );
      }

      if (filters.sellerAccountId) {
        filteredListings = filteredListings.filter(
          (listing) => listing.sellerAccountId === filters.sellerAccountId
        );
      }

      // Sort by creation date (newest first)
      filteredListings.sort((a, b) => b.createdAt - a.createdAt);

      return filteredListings;
    } catch (error) {
      console.error("Error getting marketplace listings:", error);
      throw error;
    }
  }

  /**
   * Get a specific marketplace listing
   * @param {string} listingId - The listing ID
   * @returns {Promise<Object>} Listing details
   */
  async getListing(listingId) {
    try {
      const listing = marketplaceListings.find(
        (listing) => listing.id === listingId
      );

      if (!listing) {
        throw new Error(`Listing with ID ${listingId} not found`);
      }

      return listing;
    } catch (error) {
      console.error("Error getting marketplace listing:", error);
      throw error;
    }
  }
}

module.exports = new MarketplaceService();
