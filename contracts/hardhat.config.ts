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
      url: "https://ws-opal.unique.network"
    }
  }
};

export default config;
