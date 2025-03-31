/**
 * Mali Pesa - Advanced Hedera Features
 * This file contains functionality for advanced Hedera features like token swapping,
 * staking, and marketplace operations.
 */

// Initialize UI when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing advanced Hedera features");
  initAdvancedFeatures();
});

function initAdvancedFeatures() {
  // Initialize tabs
  const tabs = document.querySelectorAll("#advanced-features-tabs .nav-link");
  const tabContents = document.querySelectorAll(".tab-pane");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) =>
        content.classList.remove("show", "active")
      );

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding content
      const target = this.getAttribute("data-bs-target");
      document.querySelector(target).classList.add("show", "active");
    });
  });

  // Initialize individual features
  initSwapInterface();
  initStakingInterface();
  initMarketplaceInterface();
}

/**
 * Initialize the token swap interface
 */
function initSwapInterface() {
  console.log("Initializing swap interface");

  const fromTokenSelect = document.getElementById("fromToken");
  const toTokenSelect = document.getElementById("toToken");
  const fromAmountInput = document.getElementById("fromAmount");
  const toAmountInput = document.getElementById("toAmount");
  const exchangeRateSpan = document.getElementById("exchangeRate");
  const swapForm = document.getElementById("swapForm");
  const swapButton = document.getElementById("executeSwap");
  const swapMessage = document.getElementById("swapMessage");

  if (
    !fromTokenSelect ||
    !toTokenSelect ||
    !fromAmountInput ||
    !toAmountInput
  ) {
    console.error("Swap interface elements not found");
    return;
  }

  // Load user portfolio data first if not already loaded
  if (!window.portfolioData || !window.currentUser) {
    console.log("Portfolio data not found, attempting to load");
    fetch("/api/portfolio")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.portfolioData = data.data;
          window.currentUser = { name: "User1", account: "0.0.12345" };
          console.log("Portfolio data loaded:", window.portfolioData);
          // Load available tokens after portfolio is loaded
          loadAvailableTokens(fromTokenSelect, toTokenSelect);
        } else {
          console.error("Failed to load portfolio data");
        }
      })
      .catch((error) => {
        console.error("Error loading portfolio data:", error);
      });
  } else {
    // Load available tokens from the user's portfolio
    loadAvailableTokens(fromTokenSelect, toTokenSelect);
  }

  // Handle from token selection change
  fromTokenSelect.addEventListener("change", function () {
    if (!this.value) return;

    // Get the exchange rate if both tokens are selected
    if (toTokenSelect.value) {
      updateExchangeRate(this.value, toTokenSelect.value);
    }
  });

  // Handle to token selection change
  toTokenSelect.addEventListener("change", function () {
    if (!this.value || !fromTokenSelect.value) return;

    // Get the exchange rate
    updateExchangeRate(fromTokenSelect.value, this.value);
  });

  // Handle amount input change
  fromAmountInput.addEventListener("input", function () {
    if (this.value && exchangeRateSpan.textContent !== "1 HBAR = 0.5 SAFCOM") {
      calculateToAmount();
    }
  });

  // Handle form submission
  swapForm.addEventListener("submit", function (e) {
    e.preventDefault();
    executeSwap();
  });

  /**
   * Update the exchange rate display
   */
  function updateExchangeRate(fromToken, toToken) {
    // Simple mock exchange rates for demo
    const rates = {
      HBAR_SAFCOM: 0.5,
      HBAR_KCB: 0.75,
      HBAR_EQTY: 0.6,
      SAFCOM_HBAR: 2.0,
      SAFCOM_KCB: 1.5,
      SAFCOM_EQTY: 1.2,
      KCB_HBAR: 1.33,
      KCB_SAFCOM: 0.67,
      KCB_EQTY: 0.8,
      EQTY_HBAR: 1.67,
      EQTY_SAFCOM: 0.83,
      EQTY_KCB: 1.25,
    };

    // Extract token symbols for rate lookup
    const fromSymbol = fromToken.includes("-")
      ? fromToken.split("-")[0]
      : fromToken;
    const toSymbol = toToken.includes("-") ? toToken.split("-")[0] : toToken;

    const rateKey = `${fromSymbol}_${toSymbol}`;
    const rate = rates[rateKey] || 1.0;

    exchangeRateSpan.textContent = `1 ${fromSymbol} = ${rate.toFixed(
      4
    )} ${toSymbol}`;

    // Recalculate amount if needed
    if (fromAmountInput.value) {
      calculateToAmount();
    }
  }

  /**
   * Calculate the amount to receive based on exchange rate
   */
  function calculateToAmount() {
    const fromAmount = parseFloat(fromAmountInput.value) || 0;
    const rateText = exchangeRateSpan.textContent;

    if (fromAmount <= 0 || !rateText || rateText === "1 HBAR = 0.5 SAFCOM") {
      toAmountInput.value = "";
      return;
    }

    // Extract rate from text (format: "1 TOKEN = X.XXXX TOKEN")
    const rateParts = rateText.split(" = ");
    if (rateParts.length !== 2) return;

    const rate = parseFloat(rateParts[1].split(" ")[0]);
    if (isNaN(rate)) return;

    toAmountInput.value = (fromAmount * rate).toFixed(4);
  }

  /**
   * Execute a token swap
   */
  function executeSwap() {
    const fromToken = fromTokenSelect.value;
    const toToken = toTokenSelect.value;
    const fromAmount = parseFloat(fromAmountInput.value);

    if (!fromToken || !toToken || fromAmount <= 0) {
      showMessage(
        swapMessage,
        "Please fill in all fields with valid values.",
        "danger"
      );
      return;
    }

    if (fromToken === toToken) {
      showMessage(swapMessage, "You cannot swap a token for itself.", "danger");
      return;
    }

    // Show processing message
    showMessage(swapMessage, "Processing your swap...", "info");

    // Simulate API call with timeout
    setTimeout(() => {
      showMessage(
        swapMessage,
        "Swap completed successfully! Your tokens have been updated.",
        "success"
      );

      // Reset form after success
      setTimeout(() => {
        fromAmountInput.value = "";
        toAmountInput.value = "";
        swapMessage.style.display = "none";
      }, 3000);
    }, 2000);
  }
}

/**
 * Load available tokens from user's portfolio into the selects
 */
function loadAvailableTokens(fromSelect, toSelect) {
  // Get the current user's tokenized stocks
  const userTokens = [];

  if (
    window.portfolioData &&
    window.currentUser &&
    window.portfolioData[window.currentUser.name]
  ) {
    const tokenizedStocks =
      window.portfolioData[window.currentUser.name].tokenizedStocks || [];

    tokenizedStocks.forEach((token) => {
      userTokens.push({
        id: token.tokenId || token.id,
        symbol: token.symbol,
        name: token.name,
        amount: token.amount || token.tokens,
      });
    });
  }

  console.log("Available user tokens for swap:", userTokens);

  // Clear existing options
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  // Add HBAR option to from select
  const hbarOption = document.createElement("option");
  hbarOption.value = "HBAR";
  hbarOption.textContent = "HBAR (Hedera)";
  fromSelect.appendChild(hbarOption);

  // Add user's tokens to the "from" select
  userTokens.forEach((token) => {
    const option = document.createElement("option");
    option.value = token.id;
    option.textContent = `${token.symbol} (${token.amount} available)`;
    option.dataset.amount = token.amount;
    fromSelect.appendChild(option);
  });

  // Add HBAR option to to select
  const hbarToOption = document.createElement("option");
  hbarToOption.value = "HBAR";
  hbarToOption.textContent = "HBAR (Hedera)";
  toSelect.appendChild(hbarToOption);

  // Add all tokens to the "to" select
  userTokens.forEach((token) => {
    const option = document.createElement("option");
    option.value = token.id;
    option.textContent = token.symbol;
    toSelect.appendChild(option);
  });

  // Add additional available tokens that might not be in user's portfolio
  const additionalTokens = [
    { id: "0.0.123456", symbol: "SCOM-T", name: "Safaricom Token" },
    { id: "0.0.123457", symbol: "EQTY-T", name: "Equity Group Token" },
    { id: "0.0.123458", symbol: "KCB-T", name: "KCB Group Token" },
  ];

  additionalTokens.forEach((token) => {
    // Check if token is already in user's portfolio
    if (!userTokens.some((t) => t.symbol === token.symbol)) {
      const toOption = document.createElement("option");
      toOption.value = token.id;
      toOption.textContent = token.symbol;
      toSelect.appendChild(toOption);
    }
  });
}

/**
 * Update the displayed available amount for the selected token
 */
function updateAvailableAmount(tokenId, availableElement) {
  if (!window.portfolioData || !window.currentUser) return;

  const user = window.currentUser.name;
  const tokenizedStocks = window.portfolioData[user].tokenizedStocks || [];
  const token = tokenizedStocks.find((t) => t.tokenId === tokenId);

  if (token) {
    availableElement.textContent = token.amount.toString();
  } else {
    availableElement.textContent = "0";
  }
}

/**
 * Get the exchange rate between two tokens
 */
function getExchangeRate(fromTokenId, toTokenId, rateElement) {
  // For demo purposes, calculate a simple exchange rate
  // In a production app, this would call the API endpoint

  fetch(`/api/swap/rate?fromToken=${fromTokenId}&toToken=${toTokenId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data) {
        const rate = data.data.rate;
        rateElement.textContent = rate.toFixed(4);
      } else {
        rateElement.textContent = "-";
      }
    })
    .catch((error) => {
      console.error("Error getting exchange rate:", error);
      rateElement.textContent = "-";
    });
}

/**
 * Calculate the amount to receive based on the amount to send and the exchange rate
 */
function calculateToAmount(fromAmount, exchangeRate, toAmountInput) {
  if (!fromAmount || exchangeRate === "-" || isNaN(parseFloat(exchangeRate))) {
    toAmountInput.value = "";
    return;
  }

  const calculatedAmount = parseFloat(fromAmount) * parseFloat(exchangeRate);
  toAmountInput.value = Math.floor(calculatedAmount); // Using floor to avoid fractional tokens
}

/**
 * Show a message in the swap form
 */
function showMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = `alert alert-${type} mt-3`;
  element.style.display = "block";
}

// Expose necessary functions to global scope for HTML event handlers
window.initSwapInterface = initSwapInterface;
