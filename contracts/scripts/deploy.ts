
import { ethers} from "hardhat"


async function main() {
  // The fee that will be passed as `msg.value` during contract deployment
  const COLLECTION_CREATION_FEE = 2n * 10n ** 18n;

  const BreedingGame = await ethers.getContractFactory("BreedingGame");

  const breedingGame = await BreedingGame.deploy({
    value: COLLECTION_CREATION_FEE,
    gasLimit: 4_500_000n // The gas limit is required
  });

  await breedingGame.waitForDeployment();

  console.log("BreedingGame deployed to:", await breedingGame.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });