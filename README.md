# ✈️ FlyToEarn

FlyToEarn is a rethinking of traditional airline miles through digital assets and decentralized finance (DeFi).

This project implements a Web2 check-in process where travelers receive:
	•	A FLYP NFT (Proof of Travel) minted on each trip, serving as verifiable proof of travel — which can be used to unlock exclusive offers on hotels, car rentals, and more.
	•	A FLYM fungible token (digital miles) credited to the user’s FireFly custody wallet.

FlyToEarn also integrates a complete DeFi layer:
	•	Users can borrow USDT using their FLYM tokens as collateral via the kLender smart contract.
	•	The borrowed USDT can be invested to earn yield through the KInvest smart contract, completing a full on-chain financial journey.


## Setting up your FireFly on your machine

1. Install the [FireFly CLI here](https://github.com/hyperledger/firefly-cli?tab=readme-ov-file#install-the-cli)
2. Create a FireFly stack by running:
   ```bash
   ff init devchallenge --block-period 2     # on MacOS --firefly-base-port  5001 
   ```
3. Start the FireFly stack by running:
   ```bash
   ff start dev
   ```

## Deploy Solidity Contracts

1. FLYP Token - ERC721 - NFT
```bash
ff deploy ethereum devchallenge solidity/deploy_files/flyp/combined.json
```

2. FLYM Token - ERC720 - Miles
```bash
ff deploy ethereum devchallenge solidity/deploy_files/flym/combined.json
```

3. USDT Token - ERC721 - Stable coint
```bash
ff deploy ethereum devchallenge solidity/deploy_files/usdt/combined.json
```

4. KLender - Lender smart contract 
```bash
ff deploy ethereum devchallenge solidity/deploy_files/klender/combined.json 
```

5. KInvest - Stake smart contract
```bash
ff deploy ethereum devchallenge solidity/deploy_files/kinvest/combined.json 
```

## Create a customer wallet 
```bash
ff accounts create devchallenge 
```

**Note:**
Make sure to update all contract addresses in the backend/config.json file.
The backend relies on these addresses to execute approveTransfer operations required by the Lend and Stake functions.

## Token Pools and Minting

1. Create token pools for FLYM (miles) and USDC (stablecoin).
2. Transfer 1000 USDC to the KInvest contract address — this balance will be used to pay out yield to users.

##  Create Custom Contract Interfaces and APIs in Firefly Sandbox

Use the ABI files located in solidity/abis/*.json to create contract interfaces:


| ABI File               | FireFly API Name |
|------------------------|------------------|
| flyp_erc721uri_abi     | FlypAPI           |
| klender_abi.json       | KLenderAPI        |
| kinvest_abi.json       | KInvestAPI        |

 If you change any of the API names, make sure to update them in the file backend/flytoearn.json accordingly.


# Backlog and Limitations
- **Customer Identity Management** 

   The project assumes that customer registration, KYC, key generation, and authentication are handled externally before reaching this frontend. These components are not included in the current implementation.


- **Miles Expiration** 

   A manual interface is provided to simulate miles expiration. In a production environment, this should be managed by a backend service and triggered via scheduled jobs or external integrations.


- **Lend & Stake Smart Contracts**

   While the smart contracts implement basic security measures (e.g., Ownable, nonReentrant), they are prototypes. Improvements are needed to support multiple loans, fetch real-time mile prices from an oracle, and enhance collateral management logic.


- **NFT Metadata (URI)**

   The current implementation uses a simulated static JSON URI for NFT metadata. In a production setting, metadata should be stored on IPFS or served from a reliable CDN to ensure permanence and verifiability.