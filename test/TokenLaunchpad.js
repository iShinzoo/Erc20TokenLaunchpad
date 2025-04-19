const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("TokenLaunchpad", function () {
  let TokenLaunchpad;
  let tokenLaunchpad;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TokenLaunchpad = await ethers.getContractFactory("TokenLaunchpad");
    tokenLaunchpad = await TokenLaunchpad.deploy();
  });

  describe("Token Creation", function () {
    it("Should create a new token with correct parameters", async function () {
      const name = "Test Token";
      const symbol = "TST";
      const initialSupply = 1000000;
      const initialPrice = ethers.parseEther("0.001"); 

      await expect(
        tokenLaunchpad.createToken(name, symbol, initialSupply, initialPrice)
      )
        .to.emit(tokenLaunchpad, "TokenCreated")
        .withArgs(anyValue, name, symbol);

      const filter = tokenLaunchpad.filters.TokenCreated();
      const events = await tokenLaunchpad.queryFilter(filter);
      const tokenAddress = events[events.length - 1].args[0];
      
      const CustomToken = await ethers.getContractFactory("CustomToken");
      const token = CustomToken.attach(tokenAddress);
      
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.totalSupply()).to.equal(
        ethers.parseUnits(initialSupply.toString(), 18)
      );
    });
  });

  describe("Token Trading", function () {
    let token;
    let tokenAddress;
    const initialSupply = 1000000;
    const tokenPrice = ethers.parseEther("0.001"); 

    beforeEach(async function () {
      const tx = await tokenLaunchpad.createToken(
        "Test Token",
        "TST",
        initialSupply,
        tokenPrice
      );
      
      const filter = tokenLaunchpad.filters.TokenCreated();
      const events = await tokenLaunchpad.queryFilter(filter);
      tokenAddress = events[events.length - 1].args[0];
      
      const CustomToken = await ethers.getContractFactory("CustomToken");
      token = CustomToken.attach(tokenAddress);
    });

    it("Should allow users to buy tokens", async function () {
      const buyAmount = ethers.parseUnits("100", 18); 
      const cost = ethers.parseEther("0.1"); 
      
      expect(await token.balanceOf(tokenLaunchpad.target)).to.equal(
        ethers.parseUnits(initialSupply.toString(), 18)
      );

      await tokenLaunchpad.connect(addr1).buyTokens(tokenAddress, buyAmount, {
        value: cost,
      });

      expect(await token.balanceOf(addr1.address)).to.equal(buyAmount);
    });

    it("Should allow users to sell tokens", async function () {
      const sellAmount = ethers.parseUnits("100", 18); 
      const expectedEth = ethers.parseEther("0.1"); 

      await tokenLaunchpad.connect(addr1).buyTokens(tokenAddress, sellAmount, {
        value: expectedEth,
      });

      await owner.sendTransaction({
        to: tokenLaunchpad.target,
        value: expectedEth,
      });

      await token.connect(addr1).approve(tokenLaunchpad.target, sellAmount);

      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      await tokenLaunchpad.connect(addr1).sellTokens(tokenAddress, sellAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(0);
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        expectedEth,
        ethers.parseEther("0.01")
      );
    });
  });

  describe("Admin Functions", function () {
    let tokenAddress;

    beforeEach(async function () {
      await tokenLaunchpad.createToken(
        "Test Token",
        "TST",
        1000000,
        ethers.parseEther("0.001")
      );
      
      const filter = tokenLaunchpad.filters.TokenCreated();
      const events = await tokenLaunchpad.queryFilter(filter);
      tokenAddress = events[events.length - 1].args[0];
    });

    it("Should allow owner to update token price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await tokenLaunchpad.updateTokenPrice(tokenAddress, newPrice);
      
      const tokenInfo = await tokenLaunchpad.listedTokens(tokenAddress);
      expect(tokenInfo.price).to.equal(newPrice);
    });

    it("Should allow owner to withdraw ETH", async function () {
      
      const ethAmount = ethers.parseEther("1.0");
      await addr1.sendTransaction({
        to: tokenLaunchpad.target,
        value: ethAmount,
      });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await tokenLaunchpad.withdrawETH();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethAmount,
        ethers.parseEther("0.01") 
      );
    });

    it("Should prevent non-owners from accessing admin functions", async function () {
      await expect(
        tokenLaunchpad.connect(addr1).updateTokenPrice(
          tokenAddress,
          ethers.parseEther("0.002")
        )
      ).to.be.revertedWithCustomError(tokenLaunchpad, "OwnableUnauthorizedAccount");

      await expect(
        tokenLaunchpad.connect(addr1).withdrawETH()
      ).to.be.revertedWithCustomError(tokenLaunchpad, "OwnableUnauthorizedAccount");
    });
  });
});