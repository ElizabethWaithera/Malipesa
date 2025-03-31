// This file serves as the entry point for Vercel deployment
// It simply requires the main server file

// Load environment variables from .env file if present
try {
  require("dotenv").config();
} catch (err) {
  console.log(
    "No .env file found or dotenv not installed. Using existing environment variables."
  );
}

// Log startup information
console.log("=== Mali Pesa - NSE Tokenization Platform ===");
console.log("Starting server in production mode...");

// Check if OpenAI API key is set
if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY;
  console.log(`OpenAI API Key exists: true`);
  console.log(`OpenAI API Key length: ${key.length}`);
  console.log(`OpenAI API Key starts with: ${key.substring(0, 9)}`);
} else {
  console.log(
    "Warning: OpenAI API key not set. AI advisor functionality will not work properly."
  );
}

// Start the server
console.log("Starting server...");
require("./server/server.js");
