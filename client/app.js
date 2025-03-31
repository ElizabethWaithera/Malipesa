// Hedera NSE Tokenization Platform - Client JS
// This connects our beautiful UI to the Hedera AI Agent backend for the Nairobi Securities Exchange

// Import the OpenAI integration

const API_URL = 'http://localhost:3000/api'; // Change to your deployed URL in production

// Global state
window.currentUser = {
  name: "Alice",
  account: "0.0.12346",
  type: "Retail Investor"
};

// Demo accounts for hackathon
const demoAccounts = {
  Alice: { account: "0.0.12346", type: "Retail Investor" },
  Bob: { account: "0.0.73921", type: "Institutional Investor" },
  Charlie: { account: "0.0.54892", type: "Foreign Investor" },
  Eve: { account: "0.0.38475", type: "Market Maker" },
};

// Sample portfolio data for demo purposes
window.portfolioData = {
  Alice: {
    name: "Alice Smith",
    account: "0.0.12346",
    type: "Retail Investor",
    cash: 150000,
    stocks: [
      {
        symbol: "SCOM",
        name: "Safaricom PLC",
        shares: 500,
        avgPrice: 23.75,
        currentPrice: 25.3,
      },
      {
        symbol: "EQTY",
        name: "Equity Group Holdings",
        shares: 300,
        avgPrice: 44.5,
        currentPrice: 45.85,
      },
      {
        symbol: "KCB",
        name: "KCB Group PLC",
        shares: 200,
        avgPrice: 37.25,
        currentPrice: 36.95,
      },
    ],
    tokenizedStocks: [],
  },
  Bob: {
    name: "Bob Johnson",
    account: "0.0.12347",
    type: "Institutional Investor",
    cash: 250000,
    stocks: [
      {
        symbol: "EABL",
        name: "East African Breweries Ltd",
        shares: 150,
        avgPrice: 175.5,
        currentPrice: 178.25,
      },
      {
        symbol: "COOP",
        name: "Co-operative Bank of Kenya",
        shares: 1000,
        avgPrice: 13.75,
        currentPrice: 13.2,
      },
    ],
    tokenizedStocks: [],
  },
  Charlie: {
    name: "Charlie Wong",
    account: "0.0.12348",
    type: "Retail Investor",
    cash: 75000,
    stocks: [
      {
        symbol: "SCOM",
        name: "Safaricom PLC",
        shares: 200,
        avgPrice: 24.5,
        currentPrice: 25.3,
      },
      {
        symbol: "BAT",
        name: "British American Tobacco Kenya",
        shares: 50,
        avgPrice: 465.25,
        currentPrice: 475.25,
      },
    ],
    tokenizedStocks: [],
  },
  Eve: {
    name: "Eve Kimani",
    account: "0.0.12349",
    type: "Retail Investor",
    cash: 100000,
    stocks: [
      {
        symbol: "KNRE",
        name: "Kenya Re-Insurance Corporation",
        shares: 2000,
        avgPrice: 2.35,
        currentPrice: 2.45,
      },
      {
        symbol: "NCBA",
        name: "NCBA Group PLC",
        shares: 500,
        avgPrice: 26.75,
        currentPrice: 24.9,
      },
    ],
    tokenizedStocks: [],
  },
};

// Transfer history
window.transferHistory = [
  {
    date: "2023-06-15",
    from: "Alice",
    to: "Bob",
    token: "SCOM",
    amount: 50,
    value: 1265,
    txId: "0.0.123456-1686834500",
  },
  {
    date: "2023-06-10",
    from: "Charlie",
    to: "Alice",
    token: "EQTY",
    amount: 30,
    value: 1375.5,
    txId: "0.0.789012-1686316800",
  },
];

// Add tokenized portfolio data
const tokenizedPortfolioData = {
  Alice: {
    tokens: [
      {
        symbol: "SCOM-T",
        name: "Safaricom Token",
        amount: 1000,
        currentPrice: 25.3,
        change: 2.3,
        changePercent: 1.2,
        tokenId: "0.0.123456",
      },
      {
        symbol: "EQTY-T",
        name: "Equity Group Token",
        amount: 500,
        currentPrice: 45.85,
        change: 1.8,
        changePercent: 0.3,
        tokenId: "0.0.123457",
      },
    ],
  },
  Bob: {
    tokens: [
      {
        symbol: "KCB-T",
        name: "KCB Group Token",
        amount: 750,
        currentPrice: 36.95,
        change: 1.2,
        changePercent: 0.3,
        tokenId: "0.0.123458",
      },
    ],
  },
};

// Initialize UI when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - initializing portfolio");
  console.log("Current user:", window.currentUser);
  console.log("Portfolio data available:", Object.keys(window.portfolioData));

  try {
    // Initialize all UI components
    initializeTokenizedStocks();
    loadPortfolioData();
    setupChatHandlers();
    setupUserSwitcher();
    setupNavigation();
    updateTransferHistory();
    loadMarketNews();
    console.log("UI initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// Update user information display
function updateUserInfo() {
  try {
    console.log("Updating user info for:", window.currentUser.name);

    // Update user display in navbar dropdown
    const userDisplay = document.querySelector(
      ".navbar-nav .nav-item:last-child .nav-link"
    );
    if (userDisplay) {
      userDisplay.innerHTML = `<i class="bi bi-person-circle"></i> ${window.currentUser.name}`;
    } else {
      console.log(
        "User display element not found, will be created by user switcher"
      );
    }

    // Update the user info card elements
    const userNameDisplay = document.getElementById("userName");
    if (userNameDisplay) {
      userNameDisplay.textContent = window.currentUser.name;
    }

    // Update header with user type and account info if it exists
    const userTypeDisplay = document.querySelector(".user-type");
    if (userTypeDisplay) {
      userTypeDisplay.textContent = window.currentUser.type || "Investor";
    }

    const accountDisplay = document.querySelector(".account-id");
    if (accountDisplay) {
      accountDisplay.textContent = window.currentUser.account || "";
    }

    // For debugging - log all available elements
    console.log(
      "Available navbar elements:",
      document.querySelectorAll(".navbar-nav .nav-item").length,
      Array.from(document.querySelectorAll(".navbar-nav .nav-item")).map((el) =>
        el.textContent.trim()
      )
    );
  } catch (error) {
    console.error("Error updating user info:", error);
  }
}

// Initialize tokenized stocks section
function initializeTokenizedStocks() {
  try {
    console.log("Initializing tokenized stocks section");
    const tokenizedStocksSection = document.getElementById(
      "tokenizedStocksSection"
    );
    const noTokensMessage = document.getElementById("noTokensMessage");

    if (!tokenizedStocksSection) {
      console.error("Tokenized stocks section not found");
      return;
    }

    // Make section visible
    tokenizedStocksSection.classList.remove("d-none");

    // Check if user has any tokenized stocks
    const userTokenizedStocks =
      window.portfolioData[window.currentUser.name].tokenizedStocks;

    if (!userTokenizedStocks || userTokenizedStocks.length === 0) {
      // Show "no tokens" message if user has no tokenized stocks
      if (noTokensMessage) {
        noTokensMessage.classList.remove("d-none");
      }
      return;
    } else {
      // Hide "no tokens" message if user has tokenized stocks
      if (noTokensMessage) {
        noTokensMessage.classList.add("d-none");
      }
    }

    // Load tokenized stocks into table
    const tableBody = document.querySelector("#tokenizedStocksTable tbody");
    if (!tableBody) {
      console.error("Tokenized stocks table body not found");
      return;
    }

    tableBody.innerHTML = "";

    userTokenizedStocks.forEach((stock) => {
      const row = document.createElement("tr");
      const value = stock.amount * stock.price;

      row.innerHTML = `
        <td><span class="badge bg-primary">${stock.symbol}</span></td>
        <td>${stock.name}</td>
        <td>${stock.amount}</td>
        <td>KES ${stock.price.toFixed(2)}</td>
        <td>KES ${value.toLocaleString("en-KE")}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-primary" onclick="window.showTransferTokenModal('${
              stock.symbol
            }', ${stock.amount})">
              <i class="bi bi-arrow-right me-1"></i>Transfer
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="window.viewTokenDetails('${
              stock.tokenId
            }')">
              <i class="bi bi-info-circle me-1"></i>Details
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });

    console.log("Tokenized stocks initialized successfully");
  } catch (error) {
    console.error("Error initializing tokenized stocks:", error);
  }
}

// Load portfolio data
async function loadPortfolioData() {
  try {
    console.log("Loading portfolio data for user:", window.currentUser.name);
    console.log("Portfolio data:", window.portfolioData);

    // In a production app, fetch data from the backend
    // For demo, we'll use local data
    const userPortfolio = window.portfolioData[window.currentUser.name];

    if (!userPortfolio) {
      console.error(
        "No portfolio data found for user:",
        window.currentUser.name
      );
      return;
    }

    // Update header with user info
    updateUserInfo();

    // Update stocks table
    const tableBody = document.querySelector("#portfolioTable tbody");
    if (!tableBody) {
      console.error("Portfolio table body not found");
      return;
    }

    tableBody.innerHTML = "";

    if (userPortfolio && userPortfolio.stocks) {
      let totalPortfolioValue = 0;

      userPortfolio.stocks.forEach((stock) => {
        const row = document.createElement("tr");
        const currentValue = stock.shares * stock.currentPrice;
        totalPortfolioValue += currentValue;

        // Calculate gains/losses
        const priceChange = stock.currentPrice - stock.avgPrice;
        const percentChange = (priceChange / stock.avgPrice) * 100;
        const isPositive = priceChange >= 0;

        row.innerHTML = `
          <td>${stock.symbol}</td>
          <td>${stock.name}</td>
          <td>${stock.shares}</td>
          <td>KES ${stock.avgPrice.toFixed(2)}</td>
          <td>KES ${stock.currentPrice.toFixed(2)}</td>
          <td>
            <span class="badge ${isPositive ? "bg-success" : "bg-danger"}">
              ${isPositive ? "+" : ""}${percentChange.toFixed(2)}%
            </span>
          </td>
          <td>KES ${currentValue.toLocaleString("en-KE")}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary btn-sm" onclick="showTokenizeModal('${
                stock.symbol
              }', ${stock.shares})">
                <i class="bi bi-currency-bitcoin me-1"></i>Tokenize
              </button>
              <button class="btn btn-outline-secondary btn-sm" onclick="showStockDetails('${
                stock.symbol
              }')">
                <i class="bi bi-info-circle me-1"></i>Details
              </button>
            </div>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Update total portfolio value
      const portfolioValueElements =
        document.querySelectorAll(".portfolio-value");
      portfolioValueElements.forEach((element) => {
        element.textContent = `KES ${totalPortfolioValue.toLocaleString(
          "en-KE"
        )}`;
      });

      // Add tokenized stocks value to total
      if (
        userPortfolio.tokenizedStocks &&
        userPortfolio.tokenizedStocks.length > 0
      ) {
        let tokenizedValue = 0;
        userPortfolio.tokenizedStocks.forEach((stock) => {
          tokenizedValue += stock.amount * stock.price;
        });

        // Update total portfolio value with tokenized stocks
        const newTotal = totalPortfolioValue + tokenizedValue;
        portfolioValueElements.forEach((element) => {
          element.textContent = `KES ${newTotal.toLocaleString("en-KE")}`;
        });
      }
    } else {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `<td colspan="8" class="text-center">No stocks in portfolio</td>`;
      tableBody.appendChild(emptyRow);
    }

    // Initialize tokenized stocks
    initializeTokenizedStocks();

    console.log("Portfolio data loaded successfully");
  } catch (error) {
    console.error("Error loading portfolio data:", error);
  }
}

// Function to tokenize a stock
async function tokenizeStock(symbol, amount) {
  try {
    const user = window.currentUser.name;
    const userPortfolio = window.portfolioData[user];

    // Find the stock in the user's portfolio
    const stockIndex = userPortfolio.stocks.findIndex(
      (s) => s.symbol === symbol
    );
    if (stockIndex === -1) {
      alert(`You don't own any ${symbol} shares to tokenize.`);
      return false;
    }

    const stock = userPortfolio.stocks[stockIndex];

    // Check if user has enough shares
    if (stock.shares < amount) {
      alert(
        `You only have ${stock.shares} shares of ${symbol}. Please enter a smaller amount.`
      );
      return false;
    }

    // In a real app, this would call the Hedera service to create tokens
    // For now, we'll simulate the tokenization process

    // Generate a token ID
    const tokenId = `0.0.${Math.floor(100000 + Math.random() * 900000)}`;

    // Deduct the shares from regular stock
    stock.shares -= amount;

    // If all shares are tokenized, remove the stock
    if (stock.shares === 0) {
      userPortfolio.stocks.splice(stockIndex, 1);
    }

    // Check if the tokenized version already exists
    const existingTokenIndex = userPortfolio.tokenizedStocks.findIndex(
      (t) => t.symbol === `${symbol}-T`
    );

    if (existingTokenIndex !== -1) {
      // Add to existing tokenized stock
      userPortfolio.tokenizedStocks[existingTokenIndex].amount += amount;
    } else {
      // Create new tokenized stock entry
      userPortfolio.tokenizedStocks.push({
        symbol: `${symbol}-T`,
        name: `${stock.name} (Tokenized)`,
        amount: amount,
        price: stock.currentPrice,
        tokenId: tokenId,
        dateTokenized: new Date().toISOString().split("T")[0],
      });
    }

    // Refresh the UI
    loadPortfolioData();

    return true;
  } catch (error) {
    console.error("Error tokenizing stock:", error);
    alert("Failed to tokenize stock. Please try again.");
    return false;
  }
}

// Function to show the tokenize modal
function showTokenizeModal(symbol, availableShares) {
  const modalTitle = document.querySelector("#actionModal .modal-title");
  const modalBody = document.querySelector("#actionModal .modal-body");
  const modalFooter = document.querySelector("#actionModal .modal-footer");

  if (!modalTitle || !modalBody || !modalFooter) return;

  modalTitle.textContent = `Tokenize ${symbol} Shares`;

  modalBody.innerHTML = `
    <p>Convert your traditional ${symbol} shares into tokenized assets on the Hedera network.</p>
    <p><strong>Benefits of tokenization:</strong></p>
    <ul>
      <li>24/7 Trading</li>
      <li>Fractional Ownership</li>
      <li>Instant Settlement</li>
      <li>Global Access</li>
    </ul>
    <div class="mb-3">
      <label for="tokenizeAmount" class="form-label">Number of Shares to Tokenize</label>
      <input type="number" class="form-control" id="tokenizeAmount" min="1" max="${availableShares}" value="1">
      <div class="form-text">You have ${availableShares} shares available to tokenize.</div>
    </div>
  `;

  modalFooter.innerHTML = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary" id="confirmTokenize">Tokenize Shares</button>
  `;

  // Show the modal
  const actionModal = new bootstrap.Modal(
    document.getElementById("actionModal")
  );
  actionModal.show();

  // Add event listener to the confirm button
  document
    .getElementById("confirmTokenize")
    .addEventListener("click", async () => {
      const amount = parseInt(document.getElementById("tokenizeAmount").value);

      if (isNaN(amount) || amount < 1 || amount > availableShares) {
        alert("Please enter a valid number of shares to tokenize.");
        return;
      }

      const success = await tokenizeStock(symbol, amount);

      if (success) {
        actionModal.hide();

        // Show success message
        const alertContainer = document.querySelector(".alert-container");
        if (alertContainer) {
          const alert = document.createElement("div");
          alert.className = "alert alert-success alert-dismissible fade show";
          alert.innerHTML = `
          <strong>Success!</strong> You have tokenized ${amount} shares of ${symbol}.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
          alertContainer.appendChild(alert);

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            alert.classList.remove("show");
            setTimeout(() => alertContainer.removeChild(alert), 150);
          }, 5000);
        }
      }
    });
}

// Show ESG details modal
function showESGDetails(symbol) {
  // Create a modal to display ESG details
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "esgModal";
  modal.setAttribute("tabindex", "-1");
  modal.setAttribute("aria-labelledby", "esgModalLabel");
  modal.setAttribute("aria-hidden", "true");

  // Add ESG data based on symbol
  let esgData;
  switch (symbol) {
    case "SCOM":
      esgData = {
        rating: "A",
        environmental: 76,
        social: 82,
        governance: 88,
        initiatives: [
          "Carbon-neutral data centers by 2030",
          "Sustainable base stations using renewable energy",
          "Digital inclusion programs for rural communities",
        ],
      };
      break;
    case "EQTY":
      esgData = {
        rating: "A-",
        environmental: 65,
        social: 91,
        governance: 85,
        initiatives: [
          "Green financing for sustainable businesses",
          "Financial inclusion through mobile banking",
          "Women empowerment programs across East Africa",
        ],
      };
      break;
    default:
      esgData = {
        rating: "B",
        environmental: 70,
        social: 75,
        governance: 80,
        initiatives: [
          "Sustainable business practices",
          "Community engagement initiatives",
          "Transparent governance structures",
        ],
      };
  }

  // Create modal content with ESG visualization
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="esgModalLabel">ESG Profile: ${symbol}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-4">
            <div class="col-md-4 text-center">
              <h5>Environmental</h5>
              <div class="display-4 text-success">${esgData.environmental}</div>
              <p class="text-muted">out of 100</p>
            </div>
            <div class="col-md-4 text-center">
              <h5>Social</h5>
              <div class="display-4 text-primary">${esgData.social}</div>
              <p class="text-muted">out of 100</p>
            </div>
            <div class="col-md-4 text-center">
              <h5>Governance</h5>
              <div class="display-4 text-info">${esgData.governance}</div>
              <p class="text-muted">out of 100</p>
            </div>
          </div>
          
          <h5>Key ESG Initiatives</h5>
          <ul class="list-group mb-4">
            ${esgData.initiatives
              .map(
                (initiative) => `<li class="list-group-item">${initiative}</li>`
              )
              .join("")}
          </ul>
          
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i> ESG ratings are updated quarterly and verified by independent auditors.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  // Add modal to document body
  document.body.appendChild(modal);

  // Initialize and show the modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Remove modal from DOM when hidden
  modal.addEventListener("hidden.bs.modal", function () {
    document.body.removeChild(modal);
  });
}

// Show stock details modal
function showStockDetails(symbol) {
  // Find the stock data
  const userPortfolio = window.portfolioData[window.currentUser.name];
  const stock = userPortfolio.stocks.find((s) => s.symbol === symbol);

  if (!stock) return;

  // Create a modal
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "stockModal";
  modal.setAttribute("tabindex", "-1");
  modal.setAttribute("aria-labelledby", "stockModalLabel");
  modal.setAttribute("aria-hidden", "true");

  // Calculate performance metrics
  const percentChange = (
    ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) *
    100
  ).toFixed(2);
  const changeClass = percentChange >= 0 ? "success" : "danger";
  const totalValue = stock.shares * stock.currentPrice;
  const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.shares;

  // Generate a random Hedera transaction ID for demo
  const txId = `0.0.${Math.floor(10000 + Math.random() * 90000)}-${Date.now()
    .toString()
    .substring(0, 10)}`;

  // Create modal content
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="stockModalLabel">${stock.name} (${
    stock.symbol
  })</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">Token Details</h5>
                  <table class="table">
                    <tr>
                      <td>Price</td>
                      <td>KES ${stock.currentPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Change</td>
                      <td class="text-${changeClass}">${
    percentChange >= 0 ? "+" : ""
  }${percentChange}%</td>
                    </tr>
                    <tr>
                      <td>Your Tokens</td>
                      <td>${stock.shares}</td>
                    </tr>
                    <tr>
                      <td>Total Value</td>
                      <td>KES ${totalValue.toLocaleString("en-KE")}</td>
                    </tr>
                    <tr>
                      <td>Gain/Loss</td>
                      <td class="text-${changeClass}">KES ${gainLoss.toLocaleString(
    "en-KE"
  )}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">Blockchain Details</h5>
                  <table class="table">
                    <tr>
                      <td>Token ID</td>
                      <td>${txId}</td>
                    </tr>
                    <tr>
                      <td>Network</td>
                      <td>Hedera Testnet</td>
                    </tr>
                    <tr>
                      <td>Tokenization Date</td>
                      <td>${new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td>Token Type</td>
                      <td>Fungible (HTS)</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12">
              <h5>Transfer History</h5>
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${new Date(
                      Date.now() - 5 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}</td>
                    <td>Market</td>
                    <td>${window.currentUser.name}</td>
                    <td>${Math.floor(stock.shares / 2)}</td>
                    <td><small>0.0.${Math.floor(
                      10000 + Math.random() * 90000
                    )}</small></td>
                  </tr>
                  <tr>
                    <td>${new Date(
                      Date.now() - 20 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}</td>
                    <td>Market</td>
                    <td>${window.currentUser.name}</td>
                    <td>${Math.ceil(stock.shares / 2)}</td>
                    <td><small>0.0.${Math.floor(
                      10000 + Math.random() * 90000
                    )}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="alert alert-primary mt-3">
            <i class="bi bi-info-circle me-2"></i> This token is verified on the Hedera Testnet and represents ownership in ${
              stock.name
            }.
          </div>
        </div>
        <div class="modal-footer">
          <a href="https://hashscan.io/testnet/token/${txId}" target="_blank" class="btn btn-info">View on Hashscan</a>
          <button type="button" class="btn btn-primary" onclick="showTransferModal('${
            stock.symbol
          }')">Transfer Tokens</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  // Add modal to document body
  document.body.appendChild(modal);

  // Initialize and show the modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Remove modal from DOM when hidden
  modal.addEventListener("hidden.bs.modal", function () {
    document.body.removeChild(modal);
  });
}

// Show transfer modal
function showTransferModal(symbol) {
  // Implementation for transfer functionality
  alert(
    `Transfer functionality for ${symbol} will be implemented for the final version.`
  );
}

// Set up chat functionality
function setupChatHandlers() {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatContainer = document.getElementById("chatContainer");

  if (!chatForm || !userInput || !chatContainer) {
    console.error("Chat elements not found");
    return;
  }

  // Add welcome message when chat initializes
  const welcomeMessage = `👋 Hello ${window.currentUser.name}! I'm your AI financial advisor for Mali Pesa.

I can help you with:
• 📊 Information about your portfolio and market trends
• 🪙 Understanding tokenization benefits and processes
• 🔄 Transferring tokens to other users (e.g., "Transfer 5 SCOM-T tokens to Bob")
• 💰 Learning about Hedera cryptocurrency and NSE stocks

Try asking me something like:
"How does tokenization work?"
"What are the advantages of tokenized stocks?"
"How is my portfolio performing today?"
"Transfer 10 KCB-T tokens to Alice"`;
  
  // Add the welcome message to the chat
  appendMessage("bot", welcomeMessage);

  // Add a quick action row below welcome message
  const quickActionsDiv = document.createElement("div");
  quickActionsDiv.className = "d-flex flex-wrap gap-2 mt-2 mb-3";
  quickActionsDiv.innerHTML = `
    <button class="btn btn-sm btn-outline-primary quick-question" data-question="How does tokenization work?">
      Tokenization Info
    </button>
    <button class="btn btn-sm btn-outline-primary quick-question" data-question="How is my portfolio performing?">
      Portfolio Summary
    </button>
    <button class="btn btn-sm btn-outline-primary quick-question" data-question="What are the benefits of tokenized stocks?">
      Tokenization Benefits
    </button>
  `;
  chatContainer.appendChild(quickActionsDiv);
  
  // Add event listeners to quick action buttons
  document.querySelectorAll('.quick-question').forEach(button => {
    button.addEventListener('click', function() {
      const question = this.getAttribute('data-question');
      userInput.value = question;
      // Trigger form submission
      const submitEvent = new Event('submit');
      chatForm.dispatchEvent(submitEvent);
    });
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    appendMessage("user", message);
    userInput.value = "";

    try {
      // Check if it's a transfer request
      if (message.toLowerCase().includes("transfer")) {
        processTransfer(message);
        return;
      }

      // Handle specific queries about portfolio data
      if (
        message.toLowerCase().includes("portfolio") &&
        message.toLowerCase().includes("today")
      ) {
        generatePortfolioSummary();
        return;
      }

      // For other queries, use the AI advisor
      console.log("Sending message to AI advisor:", message);
      appendMessage("bot", "<div class='typing-indicator'><span></span><span></span><span></span></div>");

      const response = await fetch("/api/ai-advisor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      console.log("AI advisor response status:", response.status);

      // Remove the typing indicator
      const typingIndicator = chatContainer.querySelector(".typing-indicator")?.parentNode;
      if (typingIndicator) {
        chatContainer.removeChild(typingIndicator);
      }

      if (!response.ok) {
        console.error("Error response from server:", response.status);
        appendMessage(
          "bot",
          "I apologize, but I'm having trouble connecting to the AI service. Please try again later."
        );
        return;
      }

      try {
        const data = await response.json();
        console.log("AI advisor response data:", data);

        if (data.message) {
          appendMessage("bot", data.message);
        } else if (data.error) {
          console.error("Error from AI service:", data.error);
          appendMessage(
            "bot",
            data.message ||
              "I apologize, but I'm having trouble processing your request. Please try again."
          );
        } else {
          appendMessage(
            "bot",
            "I apologize, but I'm having trouble processing your request. Please try again."
          );
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from AI response:", jsonError);
        appendMessage(
          "bot",
          "I apologize, but I received an invalid response from the AI service. Please try again."
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      appendMessage(
        "bot",
        "I apologize, but I'm having trouble processing your request. Please try again."
      );
    }
  });
}

// Add a message to the chat
function appendMessage(type, message) {
  const chatContainer = document.getElementById("chatContainer");
  if (!chatContainer) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${type === "user" ? "user" : "bot"}`;
  
  // If the message contains HTML content (like typing indicator), use innerHTML
  if (message.includes('<div') || message.includes('<span')) {
    messageDiv.innerHTML = message;
  } else {
    // Otherwise convert newlines to breaks for proper formatting
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
  }
  
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Process a transfer request
async function processTransfer(message) {
  try {
    // Parse the transfer message
    const parts = message.toLowerCase().split(" ");
    const amount = parseInt(parts[1]);
    const symbol = parts[2].toUpperCase();
    const recipient = parts[4];

    if (!amount || !symbol || !recipient) {
      appendMessage(
        "bot",
        "I couldn't understand that transfer request. Please try again with the format: 'Transfer [amount] [symbol] tokens to [recipient]'"
      );
      return;
    }

    const user = window.currentUser.name;
    const userPortfolio = window.portfolioData[user];

    // Check if this is a tokenized stock (symbol ending with -T)
    const isTokenized = symbol.endsWith("-T");

    // Find the stock/token in user's portfolio
    let stock;
    let tokenizedStock;

    if (isTokenized) {
      // Look for tokenized stock
      tokenizedStock = userPortfolio.tokenizedStocks.find(
        (t) => t.symbol === symbol
      );
      if (!tokenizedStock) {
        appendMessage("bot", `You don't own any ${symbol} tokens to transfer.`);
        return;
      }

      if (tokenizedStock.amount < amount) {
        appendMessage(
          "bot",
          `You only have ${tokenizedStock.amount} ${symbol} tokens available. Please enter a lower amount.`
        );
        return;
      }
    } else {
      // Look for regular stock
      stock = userPortfolio.stocks.find((s) => s.symbol === symbol);
      if (!stock) {
        appendMessage("bot", `You don't own any ${symbol} tokens to transfer.`);
        return;
      }

      if (stock.shares < amount) {
        appendMessage(
          "bot",
          `You only have ${stock.shares} ${symbol} tokens available. Please enter a lower amount.`
        );
        return;
      }
    }

    // Get the price and calculate value
    const price = isTokenized ? tokenizedStock.price : stock.currentPrice;
    const value = amount * price;

    // Add to transfer history
    window.transferHistory.unshift({
      date: "Just now",
      from: user,
      to: recipient,
      token: symbol,
      amount: amount,
      value: value,
      txId: `0.0.${Math.floor(100000 + Math.random() * 900000)}-${Date.now()
        .toString()
        .substring(0, 10)}`,
    });

    // Update the user's portfolio
    if (isTokenized) {
      tokenizedStock.amount -= amount;

      // If all tokens are transferred, remove the tokenized stock
      if (tokenizedStock.amount === 0) {
        const index = userPortfolio.tokenizedStocks.indexOf(tokenizedStock);
        if (index > -1) {
          userPortfolio.tokenizedStocks.splice(index, 1);
        }
      }
    } else {
      stock.shares -= amount;

      // If all shares are transferred, remove the stock
      if (stock.shares === 0) {
        const index = userPortfolio.stocks.indexOf(stock);
        if (index > -1) {
          userPortfolio.stocks.splice(index, 1);
        }
      }
    }

    // If recipient is in our demo accounts, add to their portfolio
    if (window.portfolioData[recipient]) {
      const recipientPortfolio = window.portfolioData[recipient];

      if (isTokenized) {
        // Check if recipient already has this tokenized stock
        const recipientTokenizedStock = recipientPortfolio.tokenizedStocks.find(
          (t) => t.symbol === symbol
        );

        if (recipientTokenizedStock) {
          recipientTokenizedStock.amount += amount;
        } else {
          // Make sure tokenizedStocks array exists
          if (!recipientPortfolio.tokenizedStocks) {
            recipientPortfolio.tokenizedStocks = [];
          }

          // Add new tokenized stock
          recipientPortfolio.tokenizedStocks.push({
            symbol: symbol,
            name: tokenizedStock.name,
            amount: amount,
            price: tokenizedStock.price,
            tokenId: `0.0.${Math.floor(100000 + Math.random() * 900000)}`,
            dateTokenized: new Date().toISOString().split("T")[0],
          });
        }
      } else {
        // Handle regular stock transfer
        const recipientStock = recipientPortfolio.stocks.find(
          (s) => s.symbol === symbol
        );

        if (recipientStock) {
          recipientStock.shares += amount;
        } else {
          recipientPortfolio.stocks.push({
            symbol: symbol,
            name: stock.name,
            shares: amount,
            avgPrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
          });
        }
      }
    }

    // Update UI
    loadPortfolioData();
    updateTransferHistory();

    // Display success message
    appendMessage(
      "bot",
      `✅ Success! I've transferred ${amount} ${symbol} tokens (worth KES ${value.toLocaleString(
        "en-KE"
      )}) from your account to ${recipient}. Transaction ID: ${
        window.transferHistory[0].txId
      }`
    );
  } catch (error) {
    console.error("Transfer error:", error);
    appendMessage(
      "bot",
      "I apologize, but I'm having trouble processing your transfer request. Please try again."
    );
  }
}

// Update the transfer history table
function updateTransferHistory() {
  try {
    console.log("Updating transfer history");
    const tbody = document.getElementById("transferHistory");
    if (!tbody) {
      console.error("Transfer history table body not found");
      return;
    }

    // Clear previous content
    tbody.innerHTML = "";

    if (!window.transferHistory || window.transferHistory.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `<td colspan="7" class="text-center">No transfer history available</td>`;
      tbody.appendChild(emptyRow);
      return;
    }

    // Add transfer history rows
    window.transferHistory.forEach((transfer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${transfer.date}</td>
        <td>${transfer.from}</td>
        <td>${transfer.to}</td>
        <td>${transfer.token}</td>
        <td>${transfer.amount}</td>
        <td>KES ${transfer.value.toLocaleString("en-KE")}</td>
        <td><small class="text-muted">${transfer.txId}</small></td>
      `;
      tbody.appendChild(row);
    });

    console.log("Transfer history updated successfully");
  } catch (error) {
    console.error("Error updating transfer history:", error);
  }
}

// Set up transfer buttons
function setupTransferButtons() {
  document.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("btn-outline-primary") &&
      event.target.dataset.symbol
    ) {
      const symbol = event.target.dataset.symbol;
      const input = document.querySelector("input.form-control");
      input.value = `Transfer 5 ${symbol} tokens to Bob`;
      input.focus();
    }
  });
}

// Setup user switching for demo
function setupUserSwitcher() {
  // First, check if a user dropdown already exists and remove it if it does
  const existingDropdown = document.querySelector(
    ".navbar-nav .nav-item.dropdown"
  );
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // Create a new user dropdown
  const navbarNav = document.querySelector(".navbar-nav");
  if (navbarNav) {
    const userDropdown = document.createElement("li");
    userDropdown.className = "nav-item dropdown";
    userDropdown.innerHTML = `
      <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
        <i class="bi bi-person-circle"></i> ${window.currentUser.name}
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="#" data-user="Alice">Alice</a></li>
        <li><a class="dropdown-item" href="#" data-user="Bob">Bob</a></li>
        <li><a class="dropdown-item" href="#" data-user="Charlie">Charlie</a></li>
        <li><a class="dropdown-item" href="#" data-user="Eve">Eve</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#"><i class="bi bi-gear"></i> Settings</a></li>
      </ul>
    `;
    navbarNav.appendChild(userDropdown);
  } else {
    console.error("Could not find navbar-nav element to add user switcher");
    return;
  }

  // Set up event listeners for the user switcher
  const userDropdownItems = document.querySelectorAll("[data-user]");
  userDropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const userName = this.getAttribute("data-user");
      console.log(`Switching to user: ${userName}`);

      window.currentUser = {
        name: userName,
        account: window.portfolioData[userName].account || "0.0.12345",
        type: window.portfolioData[userName].type || "Retail Investor",
      };

      // Reload data
      loadPortfolioData();
      updateTransferHistory();
      updateUserInfo();

      // Update dropdown button text
      const dropdownToggle = document.querySelector(
        ".nav-link.dropdown-toggle"
      );
      if (dropdownToggle) {
        dropdownToggle.innerHTML = `<i class="bi bi-person-circle"></i> ${userName}`;
      }

      // Add a new welcome message for the switched user
      const chatContainer = document.getElementById("chatContainer");
      if (chatContainer) {
        // Clear previous chat messages
        chatContainer.innerHTML = "";
        
        // Add a welcome message for the new user
        const welcomeMessage = `👋 Hello ${userName}! I'm your AI financial advisor for Mali Pesa.

I can help you with:
• 📊 Information about your portfolio and market trends
• 🪙 Understanding tokenization benefits and processes
• 🔄 Transferring tokens to other users (e.g., "Transfer 5 SCOM-T tokens to Bob")
• 💰 Learning about Hedera cryptocurrency and NSE stocks

Try asking me something like:
"How does tokenization work?"
"What are the advantages of tokenized stocks?"
"How is my portfolio performing today?"
"Transfer 10 KCB-T tokens to Alice"`;
        
        appendMessage("bot", welcomeMessage);
        
        // Add quick action buttons
        const quickActionsDiv = document.createElement("div");
        quickActionsDiv.className = "d-flex flex-wrap gap-2 mt-2 mb-3";
        quickActionsDiv.innerHTML = `
          <button class="btn btn-sm btn-outline-primary quick-question" data-question="How does tokenization work?">
            Tokenization Info
          </button>
          <button class="btn btn-sm btn-outline-primary quick-question" data-question="How is my portfolio performing?">
            Portfolio Summary
          </button>
          <button class="btn btn-sm btn-outline-primary quick-question" data-question="What are the benefits of tokenized stocks?">
            Tokenization Benefits
          </button>
        `;
        chatContainer.appendChild(quickActionsDiv);
        
        // Re-add event listeners to quick action buttons
        document.querySelectorAll('.quick-question').forEach(button => {
          button.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            const userInput = document.getElementById("userInput");
            if (userInput) {
              userInput.value = question;
              // Trigger form submission
              const chatForm = document.getElementById("chatForm");
              if (chatForm) {
                const submitEvent = new Event('submit');
                chatForm.dispatchEvent(submitEvent);
              }
            }
          });
        });
      }
      
      // Show notification of user switch
      showNotification(`Switched to ${userName}'s account`, "success");
    });
  });
}

// Show a notification
function showNotification(message, type = "info") {
  const alertContainer = document.querySelector(".alert-container");
  if (!alertContainer) return;
  
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 150);
  }, 5000);
}

// List of all Kenyan NSE stock symbols for validation
const NSE_SYMBOLS = [
  "SCOM",
  "EQTY",
  "KCB",
  "COOP",
  "EABL",
  "BAT",
  "BAMB",
  "KNRE",
  "NCBA",
  "SCBK",
  "JUB",
  "ABSA",
  "DTK",
  "CARB",
  "SASN",
  "ARM",
  "CFC",
  "SBIC",
  "HFCK",
  "XPRS",
  "LIMT",
  "NMG",
  "ORCH",
  "TCL",
];

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link[data-section]");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link
      this.classList.add("active");

      // Show the active section (in a real app, would show/hide sections)
      const section = this.getAttribute("data-section");
      console.log(`Navigating to ${section} section`);

      // For demo purposes, just show an alert
      if (section !== "dashboard") {
        alert(
          `The ${section} section is under development for the hackathon demo.`
        );
      }
    });
  });
}

// Load market news
function loadMarketNews() {
  try {
    console.log("Loading market news");
    const marketNewsContainer = document.getElementById("marketNews");

    if (!marketNewsContainer) {
      console.error("Market news container not found");
      return;
    }

    // Sample market news data
    const newsItems = [
      {
        title: "Safaricom reports 15.5% profit growth in Q3",
        content:
          "Safaricom PLC (SCOM) announced a 15.5% year-on-year increase in profit for the third quarter, driven by strong growth in M-PESA and data services. The company expects continued growth in the final quarter.",
        date: "Today, 10:15 AM",
        source: "Business Daily",
        relatedStocks: ["SCOM"],
      },
      {
        title: "Equity Bank expands digital banking services",
        content:
          "Equity Group Holdings (EQTY) has launched a new suite of digital banking services aimed at small businesses. The move is part of the bank's strategy to increase its digital footprint across East Africa.",
        date: "Yesterday, 2:30 PM",
        source: "The Standard",
        relatedStocks: ["EQTY"],
      },
      {
        title: "KCB Group completes acquisition of DRC bank",
        content:
          "KCB Group (KCB) has announced the completion of its acquisition of Trust Merchant Bank in the Democratic Republic of Congo. This expansion is expected to strengthen KCB's presence in Central Africa.",
        date: "2 days ago",
        source: "Reuters",
        relatedStocks: ["KCB"],
      },
    ];

    // Clear previous news
    marketNewsContainer.innerHTML = "";

    // Add news items to the container
    newsItems.forEach((news) => {
      const newsElement = document.createElement("div");
      newsElement.className = "news-item";

      // Create badges for related stocks
      const stockBadges = news.relatedStocks
        .map((stock) => `<span class="badge bg-primary me-1">${stock}</span>`)
        .join("");

      newsElement.innerHTML = `
        <h6 class="mb-1">${news.title}</h6>
        <p class="mb-2">${news.content}</p>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            ${stockBadges}
            <small class="text-muted ms-2">${news.date} • ${news.source}</small>
          </div>
          <button class="btn btn-sm btn-outline-primary">Read More</button>
        </div>
      `;

      marketNewsContainer.appendChild(newsElement);
    });

    console.log("Market news loaded successfully");
  } catch (error) {
    console.error("Error loading market news:", error);
  }
}

// Function to load tokenized portfolio data
function loadTokenizedPortfolioData() {
  const user = window.currentUser || "Alice";
  const userData = tokenizedPortfolioData[user];
  const tokenizedTable = document.getElementById("tokenizedPortfolioTable");
  const tokenizedValue = document.getElementById("tokenizedPortfolioValue");

  if (!tokenizedTable || !userData) return;

  try {
    tokenizedTable.innerHTML = "";
    let totalValue = 0;

    userData.tokens.forEach((token) => {
      const value = token.amount * token.currentPrice;
      totalValue += value;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <div class="me-2">
              <i class="fas fa-coins text-warning"></i>
            </div>
            <div>
              <div class="fw-bold">${token.name}</div>
              <small class="text-muted">${token.symbol}</small>
            </div>
          </div>
        </td>
        <td>${token.amount.toLocaleString()}</td>
        <td>KES ${token.currentPrice.toFixed(2)}</td>
        <td>KES ${value.toFixed(2)}</td>
        <td>
          <span class="badge ${
            token.changePercent >= 0 ? "bg-success" : "bg-danger"
          }">
            ${token.changePercent >= 0 ? "+" : ""}${token.changePercent.toFixed(
        2
      )}%
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="transferToken('${
            token.tokenId
          }')">
            <i class="fas fa-exchange-alt"></i> Transfer
          </button>
        </td>
      `;
      tokenizedTable.appendChild(row);
    });

    if (tokenizedValue) {
      tokenizedValue.textContent = `KES ${totalValue.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error loading tokenized portfolio:", error);
    tokenizedTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger">
          Error loading tokenized portfolio data
        </td>
      </tr>
    `;
  }
}

// Function to handle token transfers
async function transferToken(tokenId) {
  const recipient = prompt("Enter recipient's Hedera account ID:");
  const amount = prompt("Enter amount to transfer:");

  if (!recipient || !amount) return;

  try {
    const response = await fetch("/api/hedera/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenId,
        recipientAccountId: recipient,
        amount: parseInt(amount),
      }),
    });

    const data = await response.json();
    if (data.success) {
      // Get the user's tokenized stock that was transferred
      const user = window.currentUser.name;
      const userPortfolio = window.portfolioData[user];
      const tokenizedStock = userPortfolio.tokenizedStocks.find(
        (t) => t.tokenId === tokenId
      );

      if (tokenizedStock) {
        // Calculate value
        const value = parseInt(amount) * tokenizedStock.price;

        // Add to transfer history
        window.transferHistory.unshift({
          date: "Just now",
          from: user,
          to: recipient,
          token: tokenizedStock.symbol,
          amount: parseInt(amount),
          value: value,
          txId:
            data.transactionId ||
            `0.0.${Math.floor(100000 + Math.random() * 900000)}-${Date.now()
              .toString()
              .substring(0, 10)}`,
        });

        // Update the transfer history display
        updateTransferHistory();
      }

      alert("Token transfer successful!");
      loadTokenizedPortfolioData();
    } else {
      alert("Token transfer failed: " + data.error);
    }
  } catch (error) {
    console.error("Error transferring token:", error);
    alert("Error transferring token. Please try again.");
  }
}

// Expose necessary functions to global scope for HTML event handlers
window.showTokenizeModal = showTokenizeModal;
window.showTransferTokenModal = function (symbol, amount) {
  const modalTitle = document.querySelector("#actionModal .modal-title");
  const modalBody = document.querySelector("#actionModal .modal-body");
  const modalFooter = document.querySelector("#actionModal .modal-footer");

  if (!modalTitle || !modalBody || !modalFooter) return;

  modalTitle.textContent = `Transfer ${symbol} Tokens`;

  modalBody.innerHTML = `
    <p>Transfer your tokenized ${symbol} to another user.</p>
    <div class="mb-3">
      <label for="transferAmount" class="form-label">Number of Tokens to Transfer</label>
      <input type="number" class="form-control" id="transferAmount" min="1" max="${amount}" value="1">
      <div class="form-text">You have ${amount} tokens available to transfer.</div>
    </div>
    <div class="mb-3">
      <label for="transferRecipient" class="form-label">Recipient</label>
      <select class="form-select" id="transferRecipient">
        <option value="Alice">Alice</option>
        <option value="Bob">Bob</option>
        <option value="Charlie">Charlie</option>
        <option value="Eve">Eve</option>
      </select>
    </div>
  `;

  modalFooter.innerHTML = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
    <button type="button" class="btn btn-primary" id="confirmTransfer">Transfer Tokens</button>
  `;

  // Show the modal
  const actionModal = new bootstrap.Modal(
    document.getElementById("actionModal")
  );
  actionModal.show();

  // Add event listener to the confirm button
  document
    .getElementById("confirmTransfer")
    .addEventListener("click", async () => {
      const recipientName = document.getElementById("transferRecipient").value;
      const transferAmount = parseInt(
        document.getElementById("transferAmount").value
      );

      if (
        isNaN(transferAmount) ||
        transferAmount < 1 ||
        transferAmount > amount
      ) {
        alert("Please enter a valid number of tokens to transfer.");
        return;
      }

      // Call the existing transfer handling function
      const userMessage = `Transfer ${transferAmount} ${symbol} tokens to ${recipientName}`;
      processTransfer(userMessage);

      // Close the modal
      actionModal.hide();
    });
};

window.viewTokenDetails = function (tokenId) {
  const modalTitle = document.querySelector("#actionModal .modal-title");
  const modalBody = document.querySelector("#actionModal .modal-body");
  const modalFooter = document.querySelector("#actionModal .modal-footer");

  if (!modalTitle || !modalBody || !modalFooter) return;

  // Find the token
  const userPortfolio = window.portfolioData[window.currentUser.name];
  const token = userPortfolio.tokenizedStocks.find(
    (t) => t.tokenId === tokenId
  );

  if (!token) {
    alert("Token details not found");
    return;
  }

  modalTitle.textContent = `${token.name} Details`;

  modalBody.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Token Information</h5>
        <table class="table">
          <tr>
            <td><strong>Token ID:</strong></td>
            <td>${token.tokenId}</td>
          </tr>
          <tr>
            <td><strong>Symbol:</strong></td>
            <td>${token.symbol}</td>
          </tr>
          <tr>
            <td><strong>Amount:</strong></td>
            <td>${token.amount}</td>
          </tr>
          <tr>
            <td><strong>Current Price:</strong></td>
            <td>KES ${token.price.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Total Value:</strong></td>
            <td>KES ${(token.amount * token.price).toLocaleString("en-KE")}</td>
          </tr>
          <tr>
            <td><strong>Date Tokenized:</strong></td>
            <td>${token.dateTokenized}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      This token is registered on the Hedera network and can be transferred to other users.
    </div>
  `;

  modalFooter.innerHTML = `
    <button type="button" class="btn btn-primary" onclick="window.showTransferTokenModal('${token.symbol}', ${token.amount})">Transfer Tokens</button>
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
  `;

  // Show the modal
  const actionModal = new bootstrap.Modal(
    document.getElementById("actionModal")
  );
  actionModal.show();
};

window.showBuyModal = function (symbol) {
  alert(
    `Buy functionality for ${symbol} will be implemented in a future update.`
  );
};

window.showSellModal = function (symbol, shares) {
  alert(
    `Sell functionality for ${symbol} will be implemented in a future update.`
  );
};

// Function to generate portfolio summary
function generatePortfolioSummary() {
  try {
    const user = window.currentUser.name;
    const userPortfolio = window.portfolioData[user];

    if (
      !userPortfolio ||
      !userPortfolio.stocks ||
      userPortfolio.stocks.length === 0
    ) {
      appendMessage(
        "bot",
        "You don't currently have any stocks in your portfolio."
      );
      return;
    }

    // Calculate total value and performance
    let totalValue = 0;
    let totalInvested = 0;
    let gainersCount = 0;
    let losersCount = 0;

    userPortfolio.stocks.forEach((stock) => {
      const currentValue = stock.shares * stock.currentPrice;
      const invested = stock.shares * stock.avgPrice;
      totalValue += currentValue;
      totalInvested += invested;

      if (stock.currentPrice >= stock.avgPrice) {
        gainersCount++;
      } else {
        losersCount++;
      }
    });

    // Include tokenized stocks if they exist
    if (
      userPortfolio.tokenizedStocks &&
      userPortfolio.tokenizedStocks.length > 0
    ) {
      userPortfolio.tokenizedStocks.forEach((token) => {
        const tokenValue = token.amount * token.price;
        totalValue += tokenValue;
        // Assume original investment is the same as current for tokenized stocks
        totalInvested += tokenValue;
      });
    }

    const overallPerformance =
      ((totalValue - totalInvested) / totalInvested) * 100;
    const performanceText =
      overallPerformance >= 0
        ? `up ${overallPerformance.toFixed(2)}%`
        : `down ${Math.abs(overallPerformance).toFixed(2)}%`;

    // Build the response
    let response = `📊 **Portfolio Summary for ${user}**\n\n`;
    response += `Your portfolio is currently valued at KES ${totalValue.toLocaleString(
      "en-KE"
    )}, ${performanceText} overall.\n\n`;

    response += "**Top Holdings:**\n";

    // Sort stocks by value and get top 3
    const sortedStocks = [...userPortfolio.stocks].sort((a, b) => {
      return b.shares * b.currentPrice - a.shares * a.currentPrice;
    });

    sortedStocks.slice(0, 3).forEach((stock) => {
      const value = stock.shares * stock.currentPrice;
      const percentChange =
        ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
      const changeText =
        percentChange >= 0
          ? `+${percentChange.toFixed(2)}%`
          : `${percentChange.toFixed(2)}%`;

      response += `• ${stock.symbol} (${
        stock.shares
      } shares): KES ${value.toLocaleString("en-KE")} (${changeText})\n`;
    });

    // Add tokenized stocks section if available
    if (
      userPortfolio.tokenizedStocks &&
      userPortfolio.tokenizedStocks.length > 0
    ) {
      response += "\n**Tokenized Stocks:**\n";

      userPortfolio.tokenizedStocks.forEach((token) => {
        const value = token.amount * token.price;
        response += `• ${token.symbol} (${
          token.amount
        } tokens): KES ${value.toLocaleString("en-KE")}\n`;
      });
    }

    // Add some market context
    response += "\n**Market Overview:**\n";
    response += `• NSE market shows ${
      gainersCount > losersCount ? "bullish" : "bearish"
    } trends with ${gainersCount} of your stocks gaining and ${losersCount} declining.\n`;
    response +=
      "• Market news highlights include performance updates from Safaricom, Equity Bank, and KCB Group.\n\n";

    response +=
      "Would you like more detailed analysis on any specific stock in your portfolio?";

    // Display the response, replacing \n with <br> for HTML formatting
    appendMessage("bot", response.replace(/\n/g, "<br>"));
  } catch (error) {
    console.error("Error generating portfolio summary:", error);
    appendMessage(
      "bot",
      "I'm sorry, I'm having trouble retrieving your portfolio information right now. Please try again later."
    );
  }
}
