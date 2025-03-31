const express = require("express");
const router = express.Router();
const marketplaceService = require("../hedera/marketplaceService");

/**
 * GET /api/marketplace/listings
 * Get marketplace listings
 */
router.get("/listings", async (req, res) => {
  try {
    const { status, tokenId, sellerAccountId } = req.query;

    // Create filters object from query parameters
    const filters = {};
    if (status) filters.status = status;
    if (tokenId) filters.tokenId = tokenId;
    if (sellerAccountId) filters.sellerAccountId = sellerAccountId;

    const listings = await marketplaceService.getListings(filters);

    res.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error("Error getting marketplace listings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get marketplace listings",
    });
  }
});

/**
 * GET /api/marketplace/listing/:id
 * Get a specific marketplace listing
 */
router.get("/listing/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Listing ID is required",
      });
    }

    const listing = await marketplaceService.getListing(id);

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error getting marketplace listing:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get marketplace listing",
    });
  }
});

/**
 * POST /api/marketplace/create-listing
 * Create a new marketplace listing
 */
router.post("/create-listing", async (req, res) => {
  try {
    const { tokenId, sellerAccountId, amount, pricePerToken } = req.body;

    // Validate required fields
    if (!tokenId || !sellerAccountId || !amount || !pricePerToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for creating listing",
      });
    }

    // Execute the listing creation
    const result = await marketplaceService.createListing(
      tokenId,
      sellerAccountId,
      amount,
      pricePerToken
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully listed ${amount} tokens for sale at ${pricePerToken} KES per token`,
    });
  } catch (error) {
    console.error("Error creating marketplace listing:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create marketplace listing",
    });
  }
});

/**
 * POST /api/marketplace/purchase
 * Purchase tokens from a marketplace listing
 */
router.post("/purchase", async (req, res) => {
  try {
    const { listingId, buyerAccountId, amount } = req.body;

    // Validate required fields
    if (!listingId || !buyerAccountId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for purchasing tokens",
      });
    }

    // Execute the purchase
    const result = await marketplaceService.purchaseTokens(
      listingId,
      buyerAccountId,
      amount
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully purchased ${amount} tokens for ${result.totalPrice} KES`,
    });
  } catch (error) {
    console.error("Error purchasing tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to purchase tokens",
    });
  }
});

/**
 * POST /api/marketplace/cancel-listing
 * Cancel a marketplace listing
 */
router.post("/cancel-listing", async (req, res) => {
  try {
    const { listingId, accountId } = req.body;

    // Validate required fields
    if (!listingId || !accountId) {
      return res.status(400).json({
        success: false,
        error: "Both listingId and accountId are required",
      });
    }

    // Execute the cancellation
    const result = await marketplaceService.cancelListing(listingId, accountId);

    res.json({
      success: true,
      data: result,
      message: `Successfully cancelled listing ${listingId}`,
    });
  } catch (error) {
    console.error("Error cancelling listing:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to cancel listing",
    });
  }
});

module.exports = router;
