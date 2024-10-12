import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { viaIR: true },
  },
  paths: {
    artifacts: "../src/static/artifacts",
  },
  networks: {
    opal: {
      url: "https://rpc-opal.unique.network",
      accounts: ["e197ab7d719274355103327edc0218e739444570dd7992a4159b24461aab6677"]
    }
  }
};

export default config;
