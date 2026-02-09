# Galaxy Transfer Tokens - Hardhat Project

A Hardhat-based project for deploying **GalaxyRewardToken** (ERC20) and **GalaxyCrowdfund** (crowdfunding) smart contracts.

## Contracts

- **GalaxyRewardToken**: ERC20 token with minter role control.
- **GalaxyCrowdfund**: Crowdfunding platform that mints reward tokens to contributors.

## Deployment (Local Hardhat Node)

To deploy locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start a Hardhat node:
   ```bash
   npx hardhat node
   ```

3. In another terminal, deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Deployment Output (Example)

```
Starting deployment (RPC approach)...
Deploying contracts with the account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
GalaxyRewardToken deployed to: 0x5fbdb2315678afecb367f032d93f642f64180aa3
GalaxyCrowdfund deployed to: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
Set crowdfund as token minter: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512

Success!
TOKEN_ADDRESS: 0x5fbdb2315678afecb367f032d93f642f64180aa3
CROWDFUND_ADDRESS: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
```

## Running Tests

```bash
npm test
```

## Configuration

Edit `hardhat.config.cjs` to modify Solidity version, network settings, or paths.
