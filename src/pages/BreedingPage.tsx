import { useCallback, useContext, useEffect, useState } from "react";
import { AccountsContext } from "../accounts/AccountsContext";
import styled from "styled-components";
import { Token } from "../utils/types";
import { TokenCard } from "../components/TokenCard";
import { StyledTitle } from "../components/Header";
import Loader from "../components/Loader";
import { SignerTypeEnum } from "../accounts/types";
import { ethers, TransactionReceipt } from "ethers";
// Address utility from Unique NFT utils for handling cross addresses
import { Address } from "@unique-nft/utils";
// Custom hook for interacting with the blockchain and indexer
import { useChainAndScan } from "../hooks/useChainAndScan";
// The ABI of the BreedingGame contract. Run `yarn compile:contracts` to compile it
import artifacts from "../static/artifacts/contracts/BreedingGame.sol/BreedingGame.json";
import { useEthersSigner } from "../hooks/useSigner";

const BreedingPage = () => {
  // Constants defining the contract address, collection ID, and experience required to evolve
  const CONTRACT_ADDRESS = "0x8Cdff9BCC8d9Edd503D584488E2de5E9744CD049";
  const COLLECTION_ID = 3997;
  const EVOLVE_EXPERIENCE = 150;

  // SDK: chain and scan objects from the custom hook
  const { chain, scan } = useChainAndScan();
  // AccountsContext to access user's account details
  const { selectedAccount } = useContext(AccountsContext);
  // Signer for the Ethereum wallets
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(false);
  // State to store the gladiator token (special NFT used in the arena). Check BreedingGame.sol => `s_gladiator`
  const [gladiatorToken, setGladiatorToken] = useState<Token | undefined>(
    undefined
  );
  // State to store all NFTs owned by the `selectedAccount`
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  // State to track the currently selected token ID for actions like entering the arena or evolving
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Handler to select or deselect a token by its ID
  const handleSelectToken = (tokenId: number) => {
    setSelectedTokenId((prevTokenId) =>
      prevTokenId === tokenId ? null : tokenId
    );
  };

  /**
   * Helper function to send transactions to the smart contract.
   * It handles both Substrate (Polkadot) and Ethereum signers.
   *
   * @param functionName - The name of the contract function to call
   * @param functionArgs - Arguments to pass to the contract function
   * @param gasLimit - The gas limit for the transaction. It is required to explicitly provide it in this version
   * @returns The transaction hash as a string
   */
  const sendContractTransaction = async (
    functionName: string,
    functionArgs: any[] = [],
    gasLimit: bigint
  ) => {
    // Ensure the user is connected and the chain is available
    if (!selectedAccount || !chain) return;

    try {
      // Use the Unique SDK to send an EVM call
      if (selectedAccount.signerType === SignerTypeEnum.Polkadot) {
        const result = await chain.evm.send(
          {
            functionName,
            functionArgs,
            contract: {
              address: CONTRACT_ADDRESS,
              abi: artifacts.abi,
            },
            gasLimit,
          },
          { signerAddress: selectedAccount.address },
          { signer: selectedAccount.signer }
        );

        // Return the transaction hash from the extrinsic output
        return result.extrinsicOutput.hash;
        // If the signer is an Ethereum account:
      } else if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        // Instantiate the contract with the provider's signer
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          artifacts.abi,
          signer
        );
        // Call the specified function on the contract with provided arguments and gas limit
        const tx = await contract[functionName](...functionArgs, { gasLimit });
        const receipt: TransactionReceipt = await tx.wait();

        return receipt.hash;
      } else {
        // If the signer type is unsupported, throw an error
        throw new Error("Unsupported signer type");
      }
    } catch (error) {
      console.error(`Error during ${functionName}:`, error);
      throw error;
    }
  };

  /**
   * Handler to initiate the breeding process.
   * It sends a breed transaction, waits for it to be processed, and then fetches updated tokens.
   */
  const handleBreed = async () => {
    if (!selectedAccount || !chain) return;

    setLoading(true);
    try {
      // NOTE: Extract the cross address compatible with Substrate accounts
      let crossAddress = Address.extract.ethCrossAccountId(
        selectedAccount.address
      );

      // Send the breed transaction with the cross address and a specified gas limit
      await sendContractTransaction("breed", [crossAddress], 1_000_000n);

      await sleep(6000);

      await fetchGladiatorToken();
      await fetchUserTokens();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler to enter a selected token into the arena for battling.
   * It sends an enterArena transaction and updates token states after processing.
   */
  const handleEnterArena = async () => {
    if (!selectedAccount || !chain || !selectedTokenId) return;

    setLoading(true);
    try {
      // Send the enterArena transaction with the selected token ID and a specified gas limit
      await sendContractTransaction("enterArena", [selectedTokenId], 1000_000n);

      await sleep(6000);

      await Promise.all([fetchGladiatorToken(), fetchUserTokens()]);
    } catch (error) {
      // Errors are already logged in sendContractTransaction
    } finally {
      // Deselect the token and reset loading state
      setSelectedTokenId(null);
      setLoading(false);
    }
  };

  /**
   * Handler to evolve a selected token.
   * It sends an evolve transaction and updates the user tokens after processing.
   */
  const handleEvolve = async () => {
    if (!selectedAccount || !chain || !selectedTokenId) return;

    setLoading(true);
    try {
      await sendContractTransaction("evolve", [selectedTokenId], 1000_000n);

      await sleep(6000);

      await fetchUserTokens();
    } catch (error) {
    } finally {
      setSelectedTokenId(null);
      setLoading(false);
    }
  };

  /**
   * Fetches a specific token by its ID from the blockchain via Unique SDK
   *
   * @param tokenId - The ID of the token to fetch
   * @returns The Token object or undefined if not found
   */
  const fetchToken = useCallback(
    async (tokenId: number): Promise<Token | undefined> => {
      if (!chain) return undefined;
      try {
        const token = await chain.token.get({
          collectionId: COLLECTION_ID,
          tokenId,
        });
        return token;
      } catch (error) {
        console.error(`Error fetching token ${tokenId}:`, error);
        return undefined;
      }
    },
    [chain]
  );

  /**
   * Fetches the current gladiator token from the smart contract via Unique SDK.
   * The gladiator is a special token used in the arena for battles.
   */
  const fetchGladiatorToken = useCallback(async () => {
    if (!chain) return;
    try {
      const [gladiator] = await chain.evm.call({
        functionName: "getGladiator",
        functionArgs: [],
        contract: {
          address: CONTRACT_ADDRESS,
          abi: artifacts.abi,
        },
      });

      const gladiatorId = parseInt(gladiator, 10);

      // If the gladiator ID is 0 or invalid, set gladiatorToken to undefined
      if (gladiatorId === 0 || isNaN(gladiatorId)) {
        setGladiatorToken(undefined);
      } else {
        // Otherwise, fetch the gladiator token details and set it in state
        const token = await fetchToken(gladiatorId);
        setGladiatorToken(token);
      }
    } catch (error) {
      console.error("Error fetching gladiator token:", error);
      setGladiatorToken(undefined);
    }
  }, [chain, fetchToken]);

  /**
   * Fetches all tokens owned by the connected user from the Unique Network indexer.
   */
  const fetchUserTokens = useCallback(async () => {
    // Ensure the scan object and selectedAccount are available
    if (!scan || !selectedAccount) return;

    try {
      // Define parameters to filter NFTs by collection ID and owner address
      const params = {
        collectionIdIn: [COLLECTION_ID.toString()],
        topmostOwnerIn: [selectedAccount.address],
      };

      // Fetch NFTs based on the defined parameters
      const data = await scan.nfts(params);
      // Update the userTokens state with the fetched NFTs
      setUserTokens(data.items);
    } catch (error) {
      console.error("Error fetching user tokens:", error);
    }
  }, [scan, selectedAccount]);

  /**
   * Determines if the selected token can be evolved based on its attributes.
   *
   * @returns A boolean indicating if evolution is possible
   */
  const canEvolve = useCallback(() => {
    const selectedToken = userTokens.find(
      (nft) => nft.tokenId === selectedTokenId
    );
    if (!selectedToken) return false;

    const experienceAttr = selectedToken.attributes?.find(
      (attr) => attr.trait_type === "Experience"
    );
    const generationAttr = selectedToken.attributes?.find(
      (attr) => attr.trait_type === "Generation"
    );

    const experienceValue = experienceAttr?.value?.toString() || "0";
    const generationValue = generationAttr?.value?.toString() || "0";

    return (
      generationValue === "0" &&
      parseInt(experienceValue, 10) >= EVOLVE_EXPERIENCE
    );
  }, [selectedTokenId, userTokens]);

  useEffect(() => {
    fetchGladiatorToken();
    fetchUserTokens();
  }, [fetchGladiatorToken, fetchUserTokens]);

  return (
    <Container>
      {userTokens.length > 0 && (
        <>
          <StyledTitle>Arena</StyledTitle>

          <TokenCard
            token={gladiatorToken}
            fallbackImage={
              "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmWHKByMH65R75zQLkHtMv26Nifc9euYGAxngWTw9w17xy"
            }
            isActive={selectedTokenId !== null}
            onClick={handleEnterArena}
          />
          <StyledTitle>Squad</StyledTitle>
        </>
      )}

      <TokensGrid>
        {userTokens
          .filter((nft) => nft.tokenId !== gladiatorToken?.tokenId)
          .map((nft) => (
            <TokenCard
              key={nft.tokenId}
              token={nft}
              fallbackImage={""}
              isActive={nft.tokenId === selectedTokenId}
              onClick={() => handleSelectToken(nft.tokenId)}
            />
          ))}
      </TokensGrid>
      <TokenCard
        token={null}
        fallbackImage={
          "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmTysVr68jiW857ZmGHuZ5WGpYQ8YSeV5FPp2DYsTCeduP"
        }
        isActive={!!selectedAccount}
        onClick={handleBreed}
      />
      {canEvolve() && <UnicornButton onClick={handleEvolve}>🦄</UnicornButton>}
      {loading && <Loader />}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UnicornButton = styled.button`
  position: fixed;
  right: 0px;
  bottom: 20px;
  background: #ffcc00;
  border: none;
  font-size: 80px;
  color: #333;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px 0 0 5px;
  z-index: 100;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg) scale(1.1);
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const TokensGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

export default BreedingPage;
