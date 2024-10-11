// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BreedingModule = buildModule("LockModule", (m) => {
  const COLLECTION_CREATION_FEE = 2n * 10n ** 18n;

  const breedingGame = m.contract("BreedingGame", [], {
    value: COLLECTION_CREATION_FEE,
  });

  return { breedingGame };
});

export default BreedingModule;
