// OpenAI Integration for Hedera NSE Tokenization Platform
// This file contains the code to integrate OpenAI's API for intelligent responses

// Configuration for OpenAI API
const OPENAI_CONFIG = {
    model: 'gpt-4-turbo', // or 'gpt-3.5-turbo' for lower cost
    temperature: 0.7,
    max_tokens: 500
};

// Function to send user queries to OpenAI API
async function sendToOpenAI(message, portfolioData, currentUser) {
    // Show typing indicator in chat
    const chatContainer = document.querySelector('.chat-container');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai-message';
    typingIndicator.textContent = "Thinking...";
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    try {
      // Get the current user's portfolio
      const userPortfolio = portfolioData[currentUser.name];

      // Calculate total portfolio value for accuracy
      let totalValue = 0;
      userPortfolio.stocks.forEach((stock) => {
        totalValue += stock.shares * stock.currentPrice;
      });
      const totalValueWithCash = totalValue + userPortfolio.cash;

      // Find top performing stock
      let topPerformer = null;
      let topPerformancePercent = -Infinity;

      userPortfolio.stocks.forEach((stock) => {
        const performancePercent =
          ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
        if (performancePercent > topPerformancePercent) {
          topPerformer = stock;
          topPerformancePercent = performancePercent;
        }
      });

      // Call backend endpoint that securely handles OpenAI API requests
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          user: {
            name: currentUser.name,
            type: currentUser.type,
            account: currentUser.account,
          },
          portfolio: userPortfolio,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Remove typing indicator and show response
      chatContainer.removeChild(typingIndicator);
      addMessageToChat(data.response, "ai");
    } catch (error) {
      console.error("Error with AI service:", error);
      chatContainer.removeChild(typingIndicator);

      // Fallback response based on actual portfolio data when API fails
      const userPortfolio = portfolioData[currentUser.name];
      let fallbackResponse = "";

      if (message.toLowerCase().includes("portfolio")) {
        // Calculate total value
        let totalValue = 0;
        userPortfolio.stocks.forEach((stock) => {
          totalValue += stock.shares * stock.currentPrice;
        });
        const totalValueWithCash = totalValue + userPortfolio.cash;

        // Find best performing stock
        let topPerformer = null;
        let topPerformancePercent = -Infinity;
        userPortfolio.stocks.forEach((stock) => {
          const performancePercent =
            ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
          if (performancePercent > topPerformancePercent) {
            topPerformer = stock;
            topPerformancePercent = performancePercent;
          }
        });

        fallbackResponse = `Your portfolio value is KES ${totalValueWithCash.toLocaleString(
          "en-KE"
        )}, consisting of ${
          userPortfolio.stocks.length
        } stocks and KES ${userPortfolio.cash.toLocaleString(
          "en-KE"
        )} in cash. Your best performer is ${
          topPerformer.symbol
        } with a gain of ${topPerformancePercent.toFixed(2)}%.`;
      } else if (
        message.toLowerCase().includes("recommend") ||
        message.toLowerCase().includes("should i")
      ) {
        fallbackResponse =
          "Based on your current portfolio composition and market conditions, I'd recommend maintaining your diversification across banking and telecom sectors. Consider holding your current positions while market volatility settles.";
      } else {
        fallbackResponse =
          "I'm having trouble connecting to my knowledge base. Please try again with a specific question about your portfolio, stocks, or the market.";
      }

      addMessageToChat(fallbackResponse, "ai");
    }
}

// Helper function to add messages to chat display
function addMessageToChat(message, type) {
    const chatContainer = document.querySelector('.chat-container');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type === 'user' ? 'user-message' : 'ai-message'}`;
    
    // Support markdown-like formatting from OpenAI responses
    if (type === 'ai') {
        // Convert bullet points
        message = message.replace(/•\s(.*)/g, '<li>$1</li>');
        message = message.replace(/\n\s*\n/g, '<br><br>');
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // If we detected bullet points, wrap them in a ul
        if (message.includes('<li>')) {
            message = message.replace(/<li>(.*?)(?=<li>|$)/gs, '<li>$1</li>');
            message = message.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
        }
        
        messageEl.innerHTML = message;
    } else {
        messageEl.textContent = message;
    }
    
    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Export to be used in app.js
export { sendToOpenAI };
