# Token Launchpad Project

This project implements a decentralized token launchpad platform using Hardhat and Solidity. It allows users to create, buy, and sell ERC20 tokens in a decentralized manner.

## Project Overview

The platform consists of three main components:
- A token factory for creating new ERC20 tokens
- A launchpad for listing and trading tokens
- Administrative functions for managing the platform

### Key Features

- Create custom ERC20 tokens with configurable parameters
- List tokens on the launchpad with custom pricing
- Buy and sell tokens using ETH
- Administrative controls for token price updates and platform management

## Project Structure

```
├── contracts/
│   ├── Token.sol          # Custom ERC20 token implementation
│   ├── TokenLaunchpad.sol # Main launchpad contract
│   └── Lock.sol          # Sample time-lock contract
├── test/
│   ├── TokenLaunchpad.js  # Test suite for launchpad functionality
│   └── Lock.js           # Test suite for lock contract
├── ignition/
│   └── modules/          # Deployment modules
│       ├── TokenLaunchpad.js
│       └── Lock.js
```

## Technical Stack

- Solidity ^0.8.28
- Hardhat Development Environment
- OpenZeppelin Contracts v5.3.0
- Hardhat Ignition for deployments
- Hardhat Toolbox for testing and development

## Smart Contracts

### TokenLaunchpad.sol
The main contract that handles:
- Token creation and listing
- Token buying and selling functionality
- Price management
- Platform administration

### Token.sol
A customizable ERC20 token contract that:
- Implements the ERC20 standard
- Allows configuration of name, symbol, and initial supply
- Inherits from OpenZeppelin's ERC20 implementation

## Getting Started

1. Install dependencies:
```shell
npm install
```

2. Run tests:
```shell
npx hardhat test
```

3. Start local node:
```shell
npx hardhat node
```

4. Deploy contracts:
```shell
npx hardhat ignition deploy ./ignition/modules/TokenLaunchpad.js
```

## Security Features

- Ownership controls using OpenZeppelin's Ownable
- Safe math operations (built into Solidity ^0.8.0)
- Input validation and error handling
- Access control for administrative functions

## 📞 Contact
- X: [@i_krsna4](https://x.com/i_krsna4).

## License

This project is licensed under the MIT License.
