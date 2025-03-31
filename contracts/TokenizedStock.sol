// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TokenizedStock
 * @dev ERC20 token representing a tokenized NSE stock
 */
contract TokenizedStock is ERC20, Ownable, Pausable {
    // Stock information
    string public stockSymbol;
    string public stockName;
    uint256 public currentPrice;
    uint256 public lastUpdated;
    
    // Stock metadata
    string public industry;
    string public sector;
    uint256 public dividendYield;
    
    // Price history (timestamp => price)
    mapping(uint256 => uint256) public priceHistory;
    uint256[] public priceTimestamps;
    
    // Events
    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event MetadataUpdated(string industry, string sector, uint256 dividendYield);
    
    /**
     * @dev Constructor to create a tokenized stock
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _stockSymbol Original stock symbol on NSE
     * @param _stockName Full name of the stock
     * @param _initialPrice Initial price of the stock
     * @param _initialSupply Initial token supply
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _stockSymbol,
        string memory _stockName,
        uint256 _initialPrice,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        stockSymbol = _stockSymbol;
        stockName = _stockName;
        currentPrice = _initialPrice;
        lastUpdated = block.timestamp;
        
        // Add initial price to history
        priceHistory[block.timestamp] = _initialPrice;
        priceTimestamps.push(block.timestamp);
        
        // Mint initial supply to contract creator
        _mint(msg.sender, _initialSupply);
    }
    
    /**
     * @dev Update the stock price
     * @param _newPrice New price of the stock
     */
    function updatePrice(uint256 _newPrice) external onlyOwner whenNotPaused {
        uint256 oldPrice = currentPrice;
        currentPrice = _newPrice;
        lastUpdated = block.timestamp;
        
        // Add to price history
        priceHistory[block.timestamp] = _newPrice;
        priceTimestamps.push(block.timestamp);
        
        emit PriceUpdated(oldPrice, _newPrice, block.timestamp);
    }
    
    /**
     * @dev Update stock metadata
     * @param _industry Industry classification
     * @param _sector Sector classification
     * @param _dividendYield Dividend yield (scaled by 1e6)
     */
    function updateMetadata(
        string memory _industry,
        string memory _sector,
        uint256 _dividendYield
    ) external onlyOwner whenNotPaused {
        industry = _industry;
        sector = _sector;
        dividendYield = _dividendYield;
        
        emit MetadataUpdated(_industry, _sector, _dividendYield);
    }
    
    /**
     * @dev Mint new tokens
     * @param _to Address to mint tokens to
     * @param _amount Amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external onlyOwner whenNotPaused {
        _mint(_to, _amount);
    }
    
    /**
     * @dev Burn tokens
     * @param _amount Amount of tokens to burn
     */
    function burn(uint256 _amount) external whenNotPaused {
        _burn(msg.sender, _amount);
    }
    
    /**
     * @dev Pause token transfers and operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers and operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get latest price history entries
     * @param _count Number of entries to retrieve
     * @return timestamps Array of timestamps
     * @return prices Array of prices
     */
    function getPriceHistory(uint256 _count) external view returns (uint256[] memory, uint256[] memory) {
        uint256 count = _count;
        if (count > priceTimestamps.length) {
            count = priceTimestamps.length;
        }
        
        uint256[] memory timestamps = new uint256[](count);
        uint256[] memory prices = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 index = priceTimestamps.length - count + i;
            timestamps[i] = priceTimestamps[index];
            prices[i] = priceHistory[priceTimestamps[index]];
        }
        
        return (timestamps, prices);
    }
    
    /**
     * @dev Override ERC20 transfer to enforce paused state
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 
