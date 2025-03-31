# Integrating OpenAI with the Hedera NSE Tokenization Platform

This guide explains how to enhance the chatbot with OpenAI integration for more dynamic and intelligent responses.

## 1. Add the OpenAI Integration File

First, include the `openai-integration.js` file in your HTML:

```html
<!-- In index.html, add this before your app.js script -->
<script src="openai-integration.js"></script>
<script src="app.js"></script>
```

## 2. Modify the setupChatHandlers function in app.js

Replace the current `sendToBackend` function call with the new `sendToOpenAI` function:

```javascript
// In app.js, modify the setupChatHandlers function
function setupChatHandlers() {
    const chatInput = document.querySelector('input.form-control');
    const sendButton = document.querySelector('.btn-primary');
    
    function handleChat() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Process message
        if (message.toLowerCase().includes('transfer')) {
            processTransfer(message);
        } else {
            // Replace this line:
            // sendToBackend(message);
            
            // With this line:
            sendToOpenAI(message, portfolioData, currentUser);
        }
    }
    
    sendButton.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleChat();
        }
    });
}
```

## 3. Add your OpenAI API Key (for production)

For a real implementation with the actual OpenAI API, you would need to:

1. Create an API key at [https://platform.openai.com](https://platform.openai.com)
2. Add the key to your environment variables or server configuration
3. Modify the OpenAI API call in `sendToOpenAI` to use the actual API endpoint

## 4. Sample Implementation for Server-Side Integration

For security, it's better to make OpenAI API calls from your server rather than directly from the client. Here's a sample server-side implementation:

```javascript
// On your Express server (server.js)
const express = require('express');
const app = express();
app.use(express.json());

// Handle AI queries
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, userPortfolio, userName, userType } = req.body;
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a financial advisor for the Nairobi Securities Exchange.
                      The user is ${userName}, a ${userType}.
                      Their portfolio: ${JSON.stringify(userPortfolio)}.
                      Provide Kenyan stock market advice and use KES for currency.`
          },
          { role: 'user', content: message }
        ]
      })
    });
    
    const data = await openaiResponse.json();
    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
});
```

Then modify your client-side code to call this endpoint instead of simulating responses:

```javascript
async function sendToOpenAI(message, portfolioData, currentUser) {
  // Show typing indicator...
  
  try {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userPortfolio: portfolioData[currentUser.name],
        userName: currentUser.name,
        userType: currentUser.type
      })
    });
    
    const data = await response.json();
    // Remove typing indicator and display response...
    addMessageToChat(data.response, 'ai');
  } catch (error) {
    console.error('Error:', error);
    // Handle error...
  }
}
```

## 5. Benefits of OpenAI Integration

By integrating OpenAI with your platform, you'll gain:

1. **Dynamic responses**: The AI can answer a much wider range of financial questions
2. **Personalized advice**: Recommendations tailored to each user's portfolio
3. **Up-to-date information**: With proper prompting, responses can reflect recent market developments
4. **Natural conversations**: Users can ask follow-up questions and have a more fluid interaction

## 6. Considerations for Production

When moving to production:

1. **Rate limiting**: Implement proper rate limiting to manage API costs
2. **Caching**: Cache common responses to reduce API calls
3. **Error handling**: Add robust error handling for API failures
4. **Context management**: Store conversation history for more coherent responses
5. **Security**: Never expose your API keys in client-side code 
