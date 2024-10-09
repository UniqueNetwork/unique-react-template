import { useCallback, useContext, useEffect, useState } from "react";
import artifacts from "../data/breeding-game.json";
import { AccountsContext } from "../accounts/AccountsContext";
import { useChainAndScan } from "../hooks/useChainAndScan";
import styled from "styled-components";
import { Token } from "../utils/types";
import { TokenCard } from "../components/TokenCard";
import { Address } from "@unique-nft/utils";
import { StyledTitle } from "../components/Header";

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
  const contractAddress = "0x8Cdff9BCC8d9Edd503D584488E2de5E9744CD049";
  // const contractAddress = "0x00A34e85c5dB3F80B3Af710667a7D8Ce7211CA6f";
  
  const collectionId = 3997;
  // const collectionId = 3968;
  const evolveExperience = 150;

  const [loading, setLoading] = useState(false);
  const [gladiator, setGladiator] = useState<Token | undefined>(undefined);
  const [nfts, setNfts] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const { chain, scan } = useChainAndScan();
  const { selectedAccount } = useContext(AccountsContext);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const selectToken = (tokenId: number) => {
    console.log(tokenId);
    if (selectedTokenId === tokenId) setSelectedTokenId(null);
    else setSelectedTokenId(tokenId);
  };

  const breed = async () => {
    if (!selectedAccount || !chain) return;

    try {
      const crossAddress = Address.extract.ethCrossAccountId(
        selectedAccount.address
      );

      await chain.evm.send(
        {
          functionName: "breed",
          functionArgs: [crossAddress],
          contract: {
            address: contractAddress,
            abi: artifacts.abi,
          },
        },
        { signerAddress: selectedAccount.address },
        { signer: selectedAccount.signer }
      );

      await sleep(3000);

      await Promise.all([
        requestGladiator(),
        requestUserTokens()
      ]);
    } catch (error) {
      console.error("Error during breed:", error);
    } finally {
    }
  };

  const enterArena = async () => {
    if (!chain || !selectedAccount || !selectedTokenId) return;

    try {
      await chain.evm.send(
        {
          functionName: "enterArena",
          functionArgs: [selectedTokenId],
          contract: {
            address: contractAddress,
            abi: artifacts.abi,
          },
        },
        {
          signerAddress: selectedAccount.address,
        },
        { signer: selectedAccount.signer }
      );

      await sleep(3000);
      await requestGladiator();
    } catch (error) {
    } finally {
      setSelectedTokenId(null);
    }
  };

  const requestToken = useCallback(
    async (tokenId: number): Promise<Token | undefined> => {
      if (!chain) return;
      const token = await chain.token.get({ collectionId, tokenId });
      return token;
    },
    [chain, collectionId]
  );

  const requestGladiator = useCallback(async () => {
    if (!chain) return;
    try {
      const [gladiator] = await chain.evm.call({
        functionName: "getGladiator",
        functionArgs: [],
        contract: {
          address: contractAddress,
          abi: artifacts.abi,
        },
      });

      const gladiatorId = parseInt(gladiator);

      if (gladiator === 0) setGladiator(undefined);
      else {
        const token = await requestToken(gladiatorId);
        setGladiator(token);
      }
    } catch (error) {
    } finally {
    }
  }, [chain, requestToken]);

  const canEvolve = useCallback(() => {
    const selectedToken = nfts.find((nft) => nft.tokenId === selectedTokenId);
    if (!selectedToken) return false;

    const experienceAttr = selectedToken.attributes?.find(
      (attr) => attr.trait_type === "Experience"
    );
    const generationAttr = selectedToken.attributes?.find(
      (attr) => attr.trait_type === "Generation"
    );

    return (
      generationAttr?.value === "0" &&
      experienceAttr &&
      parseInt(experienceAttr.value.toString()) >= evolveExperience
    );
  }, [selectedTokenId, nfts, evolveExperience]);

  const evolve = async () => {
    if (!chain || !selectedAccount || !selectedTokenId) return;

    try {
      await chain.evm.send(
        {
          functionName: "evolve",
          functionArgs: [selectedTokenId],
          contract: {
            address: contractAddress,
            abi: artifacts.abi,
          },
        },
        {
          signerAddress: selectedAccount.address,
        },
        { signer: selectedAccount.signer }
      );

      await sleep(3000);
      await requestUserTokens();
    } catch (error) {
    } finally {
      setSelectedTokenId(null);
    }
  }

  const requestUserTokens = useCallback(async () => {
    if (!scan || !selectedAccount) return;

    try {
      const params = {
        collectionIdIn: [collectionId.toString()],
        topmostOwnerIn: [selectedAccount.address],
      };

      const data = await scan.nfts(params);
      setNfts(data.items);
    } catch (error) {
    } finally {
    }
  }, [scan, selectedAccount, collectionId]);

  useEffect(() => {
    requestGladiator();
    requestUserTokens();
  }, [requestGladiator, requestUserTokens]);

  return (
    <Container>
      <StyledTitle>Arena</StyledTitle>

        <TokenCard
          token={gladiator}
          fallbackImage={
            "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmWHKByMH65R75zQLkHtMv26Nifc9euYGAxngWTw9w17xy"
          }
          isActive={selectedTokenId !== null}
          onClick={() => enterArena()}
        />
      
      <StyledTitle>Squad</StyledTitle>

      <TokensGrid>
        {nfts.map(
          (nft) =>
            nft.tokenId !== gladiator?.tokenId && (
              <TokenCard
                key={nft.tokenId}
                token={nft}
                fallbackImage={""}
                isActive={nft.tokenId === selectedTokenId}
                onClick={() => selectToken(nft.tokenId)}
              />
            )
        )}
      </TokensGrid>
      <TokenCard
        token={null}
        fallbackImage={
          "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmTysVr68jiW857ZmGHuZ5WGpYQ8YSeV5FPp2DYsTCeduP"
        }
        isActive={!!selectedAccount}
        onClick={() => breed()}
      />
      {canEvolve() && (
        <UnicornButton onClick={() => evolve()}>
          🦄
        </UnicornButton>
      )}
    </Container>
  );
};

export default BreedingPage;
