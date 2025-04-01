

## Setting up your FireFly on your machine

1. Install the [FireFly CLI here](https://github.com/hyperledger/firefly-cli?tab=readme-ov-file#install-the-cli)
2. Create a FireFly stack by running:
   ```bash
   ff init devChallenge --block-period 2 # Please set this. We expect you to use 2 second block period for this project (as real world blockchains are not instantaneous)
   ```
3. Start the FireFly stack by running:
   ```bash
   ff start dev
   ```

Web UI for member '0': http://127.0.0.1:5001/ui
Swagger API UI for member '0': http://127.0.0.1:5001/api
Sandbox UI for member '0': http://127.0.0.1:5109

Web UI for member '1': http://127.0.0.1:5002/ui
Swagger API UI for member '1': http://127.0.0.1:5002/api
Sandbox UI for member '1': http://127.0.0.1:5209


  "token address": "0x980372b718005b5f0a86cd0141402942175baba9"

  "simple_torage address": "0xeb4ffa9f8e86f7e4de1945ac170eee24d6575432"

  token erc721uri 0x59667f7b12f7a71628fdf681dfc1b3ec87dbec0f

ff init ethereum dev 2 --block-period 2 --firefly-base-port  5001 
 docker run -v ./contracts/:/sources ethereum/solc:stable  --combined-json abi,bin -o /sources/output /sources/simple_storage.sol
 /Users/juvinski/.firefly/stacks/test/docker-compose.yml

docker run -v ./contracts/:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin -o /sources/output/combined_token.json /sources/Token.sol


 ff deploy ethereum dev contracts/output/combined.json 


# Create FF 
ff init ethereum devchallenge 3 --block-period 2 --firefly-base-port  5001 

# Start

ff start devchallenge

# Compile token contracts
 docker run -v ./:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin -o /sources/output/flyp /sources/erc721_flightpassport.sol
 docker run -v ./:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin -o /sources/output/flym /sources/erc20_flightmiles.sol
 docker run -v ./:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin -o /sources/output/usdt /sources/erc20_usdt.sol

# Deploy contracts to firefly

ff deploy ethereum devchallenge output/flyp/combined.json

# sources/erc721_flightpassport.sol:FlightPassport
# FLYP_ADDRESS = "0x532cb27bf52e305012006e858a1974a2afb2ef0e"

ff deploy ethereum devchallenge output/flym/combined.json
# sources/erc20_flightmiles.sol:FlightMiles
# FLYM_ADDRESS = "0x9a844c1a7b973e8019c458a20ea1081f2c4a9935"

ff deploy ethereum devchallenge output/usdt/combined.json
# sources/erc20_usdt.sol:USDT
# USDT_ADDRESS = "0xb1ac73cab414a4ee2cc2e4988438897fffdcc66a"


# ABIs


# compile KLender
docker run -v ./:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin --include-path /sources/node_modules/  --base-path /sources -o /sources/output/klender /sources/contracts/KLender/KLender.sol 


# deploy "ff deploy ...json usdt_address flym_address
ff deploy ethereum devchallenge output/klender/combined.json  "0xb1ac73cab414a4ee2cc2e4988438897fffdcc66a"  "0x9a844c1a7b973e8019c458a20ea1081f2c4a9935" 

# Klender address
0xa0981988976ac4b8e285ba717bab0f234d2154dd


# compile KInvest
docker run -v ./:/sources ethereum/solc:stable  --evm-version paris --combined-json abi,bin --include-path /sources/node_modules/  --base-path /sources -o /sources/output/kinvest /sources/contracts/KInvest/KInvest.sol 

# deploy "ff deploy ...json usdt_address 
ff deploy ethereum devchallenge output/kinvest/combined.json  "0xb1ac73cab414a4ee2cc2e4988438897fffdcc66a"  


# KInvest address 
0x7ae3fe156a2e51fb20eda85cd97664a5973596d4


# klender address should have usdt balance


# nginx hosts session
