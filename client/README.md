# Hedera NSE Tokenization - Hackathon Demo UI

This directory contains the user interface for the Hedera NSE Tokenization Hackathon demo. The UI is built with simple HTML, CSS, and JavaScript to showcase the functionalities of the Hedera AI Agent Toolkit.

## Getting Started

To run the complete demo (both frontend and backend), use the provided `run_demo.sh` script:

```bash
./run_demo.sh
```

This script will:
1. Check for necessary dependencies
2. Start the backend server
3. Start a simple HTTP server for the frontend
4. Open the demo in your default browser

## Demo Accounts

The demo includes several pre-configured accounts to demonstrate different user personas:

- **Alice (Retail Investor)**: Account ID 0.0.12346
- **Bob (Institutional Investor)**: Account ID 0.0.73921
- **Charlie (Foreign Investor)**: Account ID 0.0.54892
- **Eve (Market Maker)**: Account ID 0.0.38475

You can switch between these accounts using the dropdown menu in the top-right corner of the interface.

## Features Demonstrated

1. **Portfolio Dashboard**
   - Overview of tokenized stocks
   - Portfolio value and performance metrics
   - Account information

2. **Token Transfers**
   - Natural language transfer requests
   - Transaction history and confirmation
   - Cross-account transfers

3. **AI Assistant**
   - Market insights and recommendations
   - Stock price queries
   - Natural language processing

4. **Market Analysis**
   - Stock performance visualization
   - AI-generated insights
   - Buy/Sell recommendations

## Technical Implementation

The frontend communicates with the backend REST API to perform operations. For the hackathon demo, some features are simulated client-side to ensure a smooth presentation.

The `app.js` file contains the client-side logic for:
- Displaying portfolio data
- Processing natural language queries
- Simulating token transfers
- User account switching

## Customizing the Demo

You can modify the following files to customize the demo:

- `index.html`: Main UI structure and layout
- `app.js`: Client-side logic and simulated data
- `run_demo.sh`: Demo startup configuration

## Troubleshooting

If you encounter issues:

1. **Backend connection errors**:
   - Ensure the backend server is running on port 3000
   - Check the browser console for API errors

2. **Display issues**:
   - Try refreshing the page
   - Ensure all Bootstrap dependencies are loaded

3. **Script execution problems**:
   - Make sure the script has execution permissions: `chmod +x run_demo.sh`

## Additional Resources

- See `../deployment/PRESENTATION_GUIDE.md` for a complete presentation script
- Refer to `../deployment/README.md` for cloud deployment instructions
- Check `../deployment/architecture.txt` for a system architecture diagram

## Feedback and Contributions

We welcome feedback and contributions to improve the demo. Please feel free to open issues or submit pull requests to enhance the functionality or user experience. 
