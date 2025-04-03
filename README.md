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
   ff start devchallenge
   ```

## Deploy Solidity Contracts

1. FLYP Token - ERC721 - NFT
```bash
ff deploy ethereum devchallenge solidity/deploy_files/flyp/combined.json
```

2. FLYM Token - ERC720 - Miles - Copy this address!
```bash
ff deploy ethereum devchallenge solidity/deploy_files/flym/combined.json
```

3. USDT Token - ERC721 - Stable coint - Copy this address!
```bash
ff deploy ethereum devchallenge solidity/deploy_files/usdt/combined.json
```

4. KLender - Lender smart contract 
```bash
ff deploy ethereum devchallenge solidity/deploy_files/klender/combined.json  "USDT_TOKEN_ADDRESS" "FLYM_TOTAL_ADDRESS" "SIGNING_KEY"
```

5. KInvest - Stake smart contract
```bash
ff deploy ethereum devchallenge solidity/deploy_files/kinvest/combined.json  "USDT_TOKEN_ADDRESS"
```

## Create a customer wallet 
```bash
ff accounts create devchallenge 
```

**Note:**
~~Make sure to update all contract addresses in the backend/config.json file.~~ 
The backend automatically fetches the contract address. Used for approveTransfer operations required by the Lend and Stake functions.

## Token Pools and Minting

1. Create token pools for FLYM (miles) and USDC (stablecoin).
2. Transfer 1000 USDC to the KLender contract address.
3. Transfer 1000 USDC to the KInvest contract address — this balance will be used to pay out yield to users.

##  Create Custom Contract Interfaces and APIs in Firefly Sandbox

Use the ABI files located in solidity/abis/*.json to create contract interfaces:


| ABI File               | FireFly API Name |
|------------------------|------------------|
| flyp_erc721uri_abi     | FlypAPI           |
| klender_abi.json       | KLenderAPI        |
| kinvest_abi.json       | KInvestAPI        |

 If you change any of the API names, make sure to update them in the file backend/config.json accordingly.

## Start the Backend

```bash
cd backend
npm install
npm start
```
 > This will install all backend dependencies and start the Express server on http://localhost:4000. 


### Start the frontend
```bash 
cd frontend
npm install
npm start
```
   > This will launch the React-based UI on http://localhost:3000.


## Ready to Play?

Follow the steps below to experience the full FlyToEarn journey:

1. **Start the App**  
   Open [http://localhost:4000](http://localhost:4000) in your browser.  
   > The system assumes you’ve already purchased a ticket, completed KYC, and your wallet key is registered on FireFly.

2. **Simulate a Flight**  
   Navigate to `KAirline / Check-in` and submit your travel details.  
   > The backend will mint a **FLYP NFT (Proof of Travel)** and **FLYM miles tokens**, transferring both to your FireFly custody wallet.

3. **View Your Travel NFTs**  
   Go to `KAirline / Proof of Travel` to see a visual gallery of all your FLYP NFTs.  
   > Metadata is fetched from the NFT URI and rendered as cards.

4. **Check Miles Balance**  
   Visit `KAirline / Miles Balance` to see your FLYM balance and the last updated timestamp.

5. **Borrow USDT Using Your Miles**  
   Head to `KBank / Lend` to borrow **USDT** using your FLYM as collateral.  
   > Loans are 100% collateralized and accrue **5% interest/year**.

6. **Stake Your USDT for Yield**  
   With USDT in hand, go to `KBank / Invest` to stake and earn **7% interest/year**.

7. **Withdraw Investment**  
   After staking, return to `KBank / Invest` to **unstake** and withdraw your principal + accumulated interest.

8. **Repay Your Loan**  
   Use the recovered USDT to go back to `KBank / Lend` and **repay** your loan, reclaiming your FLYM collateral.

---

**Note:**  
If you encounter balance-related errors, make sure you’ve completed the steps in the **[Token Pools and Minting](#-token-pools-and-minting)** section to initialize the system properly.


# Backlog and Limitations
- **Customer Identity Management** 

   The project assumes that customer registration, KYC, key generation, and authentication are handled externally before reaching this frontend. These components are not included in the current implementation.


- **Miles Expiration** 

   A manual interface is provided to simulate miles expiration. In a production environment, this should be managed by a backend service and triggered via scheduled jobs or external integrations.


- **Lend & Stake Smart Contracts**

   While the smart contracts implement basic security measures (e.g., Ownable, nonReentrant), they are prototypes. Improvements are needed to support multiple loans, fetch real-time mile prices from an oracle, and enhance collateral management logic.


- **NFT Metadata (URI) & Images**

   The current implementation uses a simulated static JSON URI for NFT metadata. In a production setting, metadata should be stored on IPFS or served from a reliable CDN to ensure permanence and verifiability.


## Optional Setup for Networking Tests

1. Create a DNS entry or local alias
   `10.0.0.3 flytoearn.dev`

2.	Configure Nginx for the custom domain
Create a /etc/nginx/sites-available/flytoearn.dev file and link it on sites-enabled

```bash
server {
        server_name fly_to_earn.dev;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        # React Frontend
        location / {         
                proxy_pass http://127.0.0.1:4000;
        }
        # Next backend
        location /api {
                proxy_pass http://127.0.0.1:3000;
        }

}
```
   > Adjust `frontend/vite.config.ts` and `backend/config.ts`
   
   > After setting this up, restart Nginx: `sudo systemctl restart nginx`