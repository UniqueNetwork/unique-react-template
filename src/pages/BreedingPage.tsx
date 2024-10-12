import { useCallback, useContext, useEffect, useState } from "react";
import artifacts from "../static/artifacts/contracts/BreedingGame.sol/BreedingGame.json";
import { AccountsContext } from "../accounts/AccountsContext";
import { useChainAndScan } from "../hooks/useChainAndScan";
import styled from "styled-components";
import { Token } from "../utils/types";
import { TokenCard } from "../components/TokenCard";
import { Address } from "@unique-nft/utils";
import { StyledTitle } from "../components/Header";
import Loader from "../components/Loader";
import { SignerTypeEnum } from "../accounts/types";
import { ethers, TransactionReceipt } from "ethers";

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

const BreedingPage = () => {
  const CONTRACT_ADDRESS = "0x8Cdff9BCC8d9Edd503D584488E2de5E9744CD049";
  const COLLECTION_ID = 3997;
  const EVOLVE_EXPERIENCE = 150;

  const {chain, scan} = useChainAndScan();
  const {selectedAccount} = useContext(AccountsContext);

  const [loading, setLoading] = useState(false);
  const [gladiatorToken, setGladiatorToken] = useState<Token | undefined>(
    undefined
  );
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleSelectToken = (tokenId: number) => {
    setSelectedTokenId((prevTokenId) =>
      prevTokenId === tokenId ? null : tokenId
    );
  };

  // Helper function to send transactions
  const sendContractTransaction = async (
    functionName: string,
    functionArgs: any[] = [],
    gasLimit: bigint
  ) => {
    if (!selectedAccount || !chain) return;

    try {
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

        return result.extrinsicOutput.hash;
      } else if (selectedAccount.signerType === SignerTypeEnum.Ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          artifacts.abi,
          await provider.getSigner()
        );
        const tx = await contract[functionName](...functionArgs, { gasLimit });
        const receipt: TransactionReceipt = await tx.wait();

        return receipt.hash;
      } else {
        throw new Error("Unsupported signer type");
      }
    } catch (error) {
      console.error(`Error during ${functionName}:`, error);
      throw error;
    }
  };

  const handleBreed = async () => {
    if (!selectedAccount || !chain) return;

    setLoading(true);
    try {
      let crossAddress = Address.extract.ethCrossAccountId(
        selectedAccount.address
      );

      await sendContractTransaction("breed", [crossAddress], 1_000_000n);

      await sleep(6000);

      await fetchGladiatorToken();
      await fetchUserTokens();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleEnterArena = async () => {
    if (!selectedAccount || !chain || !selectedTokenId) return;

    setLoading(true);
    try {
      await sendContractTransaction("enterArena", [selectedTokenId], 1000_000n);

      await sleep(6000);

      await Promise.all([fetchGladiatorToken(), fetchUserTokens()]);
    } catch (error) {
      // Error is already logged
    } finally {
      setSelectedTokenId(null);
      setLoading(false);
    }
  };

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

      if (gladiatorId === 0 || isNaN(gladiatorId)) {
        setGladiatorToken(undefined);
      } else {
        const token = await fetchToken(gladiatorId);
        setGladiatorToken(token);
      }
    } catch (error) {
      console.error("Error fetching gladiator token:", error);
      setGladiatorToken(undefined);
    }
  }, [chain, fetchToken]);

  const fetchUserTokens = useCallback(async () => {
    if (!scan || !selectedAccount) return;

    try {
      const params = {
        collectionIdIn: [COLLECTION_ID.toString()],
        topmostOwnerIn: [selectedAccount.address],
      };

      const data = await scan.nfts(params);
      setUserTokens(data.items);
    } catch (error) {
      console.error("Error fetching user tokens:", error);
    }
  }, [scan, selectedAccount]);

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

export default BreedingPage;
