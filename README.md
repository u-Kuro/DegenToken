# DegenToken

The project aims to test and deploy the smart contract to the Avalanche Fuji Testnet, verify it on Snowtrace.

## Project Objective

1. Create an ERC-20 token named "Degen" with the symbol "DGN".
2. Test the smart contract, ensuring that all tests pass.
3. Deploy the smart contract to the Avalanche Fuji Testnet.
4. Perform tests on the testnet, ensuring that all tests pass.
5. Verify the smart contract on Snowtrace.
6. Share the verified smart contract with the project team.


## SnowTrace Verification

The Degen token smart contract has been verified on SnowTrace. The contract address and token address on SnowTrace are as follows:

- Contract address: [0x372e3553Cdfc00b74dff723fe10D9EDed402Afa1](https://testnet.snowtrace.io/address/0x372e3553cdfc00b74dff723fe10d9eded402afa1)
- Token in contract address: [0x372e3553Cdfc00b74dff723fe10D9EDed402Afa1](https://testnet.snowtrace.io/token/0x372e3553cdfc00b74dff723fe10d9eded402afa1)

## Solidity Contract

The Solidity contract represents the implementation of the DegenToken ERC-20 token. It includes the following functionalities:

- Minting tokens: The contract owner can mint tokens and assign them to specific addresses.
- Transferring tokens: Tokens can be transferred between accounts.
- Redeeming tokens: Any address can redeem their own NFT prize using their tokens.
- Burning tokens: Any address can burn the tokens they own.
- Checking token balance: Addresses can check their token balance.

## Degen Token Tests

The Degen token tests are implemented to ensure the proper functionality of the smart contract in both hardhat and fuji network. The tests cover scenarios such as checking the name and symbol, minting tokens, transferring tokens, redeeming tokens, burning tokens, and checking the token balance.

Please refer to the provided links for more details about the verified smart contract on SnowTrace.
