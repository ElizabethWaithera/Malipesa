# Mali Pesa - Hedera NSE Tokenization Platform

Mali Pesa is an innovative trading platform that combines traditional NSE (Nairobi Securities Exchange) stock trading with blockchain tokenization through the Hedera network. "Mali" means "wealth" in Swahili, reflecting our mission to help Kenyans build wealth through modern investment technology.

## Features

### Core Features
- **Stock Tokenization**: Convert your traditional NSE stocks into digital tokens on the Hedera blockchain
- **Token Transfers**: Transfer your tokenized stocks instantly to any user with a Hedera account
- **Real-Time Market Data**: Access current market news and stock information
- **AI Investment Advisor**: Get personalized guidance on your portfolio through natural language

### Advanced Hedera Features
- **Token Swap**: Exchange between different token types with minimal fees
- **Token Staking**: Stake your tokens to earn yield with different lock-up periods
- **Tokenized Stock Marketplace**: Buy and sell tokenized stocks directly from other users

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express
- **Blockchain**: Hedera Hashgraph
  - Hedera Token Service (HTS)
  - Hedera Consensus Service (HCS)
  - Hedera Smart Contract Service
- **AI**: OpenAI API for the investment advisor
- **Hedera AI Agent Kit**: Intelligent agent framework for automation and enhanced user interactions

## AI Agent Integration

Mali Pesa leverages the Hedera AI Agent Kit to provide intelligent interactions and automation:

- **Natural Language Processing**: Understand and respond to user queries about investments, tokenization, and transactions
- **Autonomous Transactions**: Execute token transfers, swaps, and other operations through conversational commands
- **Portfolio Analysis**: Analyze user portfolios and provide personalized investment recommendations
- **Market Intelligence**: Monitor market trends and news to offer timely insights
- **Learning Capabilities**: Adapt to user preferences and improve recommendations over time

The AI agent serves as a bridge between traditional financial services and blockchain technology, making complex operations accessible through simple conversation.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- Hedera testnet account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ElizabethWaithera/Malipesa.git
   cd Malipesa
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Update the environment variables with your Hedera testnet account ID, private key, and OpenAI API key.

4. Start the application:
   ```
   ./start.sh
   ```
   Or use:
   ```
   npm run dev
   ```

5. Open the application in your browser at `http://localhost:3000`

## Deployment

The application can be deployed to Vercel:

```
vercel --prod
```

## Additional Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Token Service](https://hedera.com/token-service)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

## License

[MIT](LICENSE)

## Acknowledgments

- Nairobi Securities Exchange (NSE) for market data
- Hedera for blockchain infrastructure
- OpenAI for AI capabilities
