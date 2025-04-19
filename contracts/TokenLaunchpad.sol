// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// #TokenLaunchpad - 0x5FbDB2315678afecb367f032d93F642f64180aa3

contract TokenLaunchpad is Ownable {
    constructor() Ownable(msg.sender) {}
    struct TokenInfo {
        address tokenAddress;
        uint256 price; 
        bool isListed;
    }

    mapping(address => TokenInfo) public listedTokens;
    
    event TokenCreated(address tokenAddress, string name, string symbol);
    event TokenListed(address tokenAddress, uint256 price);
    event TokenPurchased(address buyer, address tokenAddress, uint256 amount);
    event TokenSold(address seller, address tokenAddress, uint256 amount);

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 initialPrice
    ) external returns (address) {
        CustomToken newToken = new CustomToken(name, symbol, initialSupply);
        address tokenAddress = address(newToken);
        
        listedTokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            price: initialPrice,
            isListed: true
        });

        emit TokenCreated(tokenAddress, name, symbol);
        emit TokenListed(tokenAddress, initialPrice);
        
        return tokenAddress;
    }

    function buyTokens(address tokenAddress, uint256 amount) external payable {
        require(listedTokens[tokenAddress].isListed, "Token not listed");
        TokenInfo memory tokenInfo = listedTokens[tokenAddress];
        
        uint256 totalCost = (amount * tokenInfo.price) / 1e18;
        require(msg.value >= totalCost, "Insufficient ETH sent");

        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
        
        token.transfer(msg.sender, amount);
        
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokenPurchased(msg.sender, tokenAddress, amount);
    }

    function sellTokens(address tokenAddress, uint256 amount) external {
        require(listedTokens[tokenAddress].isListed, "Token not listed");
        TokenInfo memory tokenInfo = listedTokens[tokenAddress];
        
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        uint256 ethAmount = (amount * tokenInfo.price) / 1e18;
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        payable(msg.sender).transfer(ethAmount);
        
        emit TokenSold(msg.sender, tokenAddress, amount);
    }

    function updateTokenPrice(address tokenAddress, uint256 newPrice) external onlyOwner {
        require(listedTokens[tokenAddress].isListed, "Token not listed");
        listedTokens[tokenAddress].price = newPrice;
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}