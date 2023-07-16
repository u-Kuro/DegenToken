require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

const FORK_FUJI = false
const FORK_MAINNET = false
const forkingData = FORK_FUJI
  ? {
    url: "https://api.avax-test.network/ext/bc/C/rpc",
  }
  : FORK_MAINNET
    ? {
      url: "https://api.avax.network/ext/bc/C/rpc",
    }
    : undefined
let accounts = forkingData ? [
  process.env.WALLET_PRIVATE_KEY,
  process.env.WALLET_PRIVATE_KEY_2,
  process.env.WALLET_PRIVATE_KEY_3
]
  :
  [process.env.WALLET_PRIVATE_KEY]

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  etherscan: {
    apiKey: process.env.SNOWTRACE_API_KEY, // we use an .env file to hide our Snowtrace API KEY
  },
  solidity: "0.8.18",
  networks: {
    hardhat: {
      gasPrice: 25000000000,
      chainId: !forkingData ? 43112 : undefined, //Only specify a chainId if we are not forking
      forking: forkingData,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 25000000000,
      chainId: 43113,
      accounts: accounts, // we use a .env file to hide our wallets private key
    },
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 25000000000,
      chainId: 43114,
      accounts: accounts,
    },
  },
};
