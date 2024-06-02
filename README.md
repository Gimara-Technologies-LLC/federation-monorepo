# ☁ Federation Cloud

🚀 A decentralized Software as a Service marketing platform that transforms marketing in the new decentralized world. We provide the tools and services across multiple blockchains where people and industries can continously operate and exchange value safely and confortably.

We are leveraging multiple tools across the web3 ecosystem to be able to delier value to persons without worrying about trust and profitability.

- Using Chainlink's products like CCIP, Functions, and Data Feeds, we are aiming to have people connect to the blockchain from wherever their value lies and and have clear store of their value.

- We are also incorporating decentralized messaging services to allow for swift and direct interaction between individuals and companies.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript, **Scaffold-Eth 2** as the base.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Getting Started

1. Install dependencies

```
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

4. On a third terminal, start your NextJS app:

```
yarn start
```

### Environment

Create a new file by copying the .env.example file, and name it .env. Fill in your wallet's private key, and all respective RPC URLs for at least two blockchains.

```
PRIVATE_KEY=""

ETHERSCAN_OPTIMISM_KEY=""
POLYGONSCAN_KEY=""

ETHEREUM_SEPOLIA_RPC_URL="https://ethereum-sepolia.publicnode.com"
AVALANCHE_FUJI_RPC_URL="https://avalanche-fuji-c-chain.publicnode.com"
POLYGON_MUMBAI_RPC_URL="https://polygon-mumbai-bor.publicnode.com"
BASE_SEPOLIA_RPC_URL="https://base-sepolia.publicnode.com"
OPTIMISM_SEPOLIA_RPC_URL="https://optimism-sepolia.publicnode.com"
```

## Documentation

Coming Soon
