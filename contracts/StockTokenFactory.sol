// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenizedStock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StockTokenFactory
 * @dev Factory contract to create and manage tokenized NSE stocks
 */
contract StockTokenFactory is Ownable, Pausable {
    // Mapping of stock symbol to contract address
    mapping(string => address) public stockTokens;
    // Array of all stock symbols
    string[] public stockSymbols;
    
    // Oracle address authorized to update prices
    address public priceOracle;
    
    // Events
    event StockTokenCreated(string symbol, address tokenAddress);
    event PriceOracleUpdated(address oldOracle, address newOracle);
    event PricesUpdated(uint256 count, uint256 timestamp);
    
    /**
     * @dev Constructor to initialize the factory
     * @param _priceOracle Address of the oracle authorized to update prices
     */
    constructor(address _priceOracle) {
        priceOracle = _priceOracle;
    }
    
    /**
     * @dev Set a new price oracle
     * @param _newOracle Address of the new price oracle
     */
    function setPriceOracle(address _newOracle) external onlyOwner {
        address oldOracle = priceOracle;
        priceOracle = _newOracle;
        emit PriceOracleUpdated(oldOracle, _newOracle);
    }
    
    /**
     * @dev Create a new tokenized stock
     * @param _tokenName Token name
     * @param _tokenSymbol Token symbol
     * @param _stockSymbol Original stock symbol on NSE
     * @param _stockName Full name of the stock
     * @param _initialPrice Initial price of the stock
     * @param _initialSupply Initial token supply
     * @return address of the created token
     */
    function createStockToken(
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _stockSymbol,
        string memory _stockName,
        uint256 _initialPrice,
        uint256 _initialSupply
    ) external onlyOwner whenNotPaused returns (address) {
        // Check if stock token already exists
        require(stockTokens[_stockSymbol] == address(0), "Stock token already exists");
        
        // Create new token contract
        TokenizedStock token = new TokenizedStock(
            _tokenName,
            _tokenSymbol,
            _stockSymbol,
            _stockName,
            _initialPrice,
            _initialSupply
        );
        
        // Store token address
        stockTokens[_stockSymbol] = address(token);
        stockSymbols.push(_stockSymbol);
        
        emit StockTokenCreated(_stockSymbol, address(token));
        return address(token);
    }
    
    /**
     * @dev Update prices for multiple stocks at once
     * @param _symbols Array of stock symbols
     * @param _prices Array of new prices
     */
    function updatePrices(
        string[] memory _symbols,
        uint256[] memory _prices
    ) external whenNotPaused {
        // Only the oracle can update prices
        require(msg.sender == priceOracle || msg.sender == owner(), "Caller is not authorized");
        
        // Ensure arrays have the same length
        require(_symbols.length == _prices.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _symbols.length; i++) {
            address tokenAddress = stockTokens[_symbols[i]];
            if (tokenAddress != address(0)) {
                TokenizedStock token = TokenizedStock(tokenAddress);
                token.updatePrice(_prices[i]);
            }
        }
        
        emit PricesUpdated(_symbols.length, block.timestamp);
    }
    
    /**
     * @dev Update metadata for a stock token
     * @param _symbol Stock symbol
     * @param _industry Industry classification
     * @param _sector Sector classification
     * @param _dividendYield Dividend yield (scaled by 1e6)
     */
    function updateStockMetadata(
        string memory _symbol,
        string memory _industry,
        string memory _sector,
        uint256 _dividendYield
    ) external onlyOwner whenNotPaused {
        address tokenAddress = stockTokens[_symbol];
        require(tokenAddress != address(0), "Stock token does not exist");
        
        TokenizedStock token = TokenizedStock(tokenAddress);
        token.updateMetadata(_industry, _sector, _dividendYield);
    }
    
    /**
     * @dev Get all stock tokens
     * @return symbols Array of stock symbols
     * @return addresses Array of token addresses
     */
    function getAllStockTokens() external view returns (string[] memory, address[] memory) {
        address[] memory addresses = new address[](stockSymbols.length);
        
        for (uint256 i = 0; i < stockSymbols.length; i++) {
            addresses[i] = stockTokens[stockSymbols[i]];
        }
        
        return (stockSymbols, addresses);
    }
    
    /**
     * @dev Get stock token by symbol
     * @param _symbol Stock symbol
     * @return tokenAddress Address of the token contract
     */
    function getStockToken(string memory _symbol) external view returns (address) {
        return stockTokens[_symbol];
    }
    
    /**
     * @dev Pause factory and all token operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause factory and all token operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 
