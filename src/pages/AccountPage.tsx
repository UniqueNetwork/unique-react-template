import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { SdkContext } from "../sdk/SdkContext";
import { AccountsContext } from "../accounts/AccountsContext";
import { Address } from "@unique-nft/utils";

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 24px;
  width: 250px;

  &:hover {
    opacity: 0.8;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin-bottom: 35px;
  text-align: left;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InfoItem = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  width: 80%;
  justify-content: space-between;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const AccountPage = () => {
  const { accounts } = useContext(AccountsContext);
  const accountsArray = Array.from(accounts.values());

  const { sdk } = useContext(SdkContext);
  const { accountId } = useParams<{ accountId: string }>();
  const currentAccount = useMemo(
    () => accountsArray.find((acc) => acc.address === accountId),
    [accountId, accountsArray]
  );
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchaccountBalance = async () => {
      try {
        const balance = await sdk.balance.get({
          address: accountId,
        });

        setAccountBalance(balance);
      } catch (error) {
        setError("Failed to fetch account data. Please try again later.");
      }
    };

    if (!sdk) return;
    if (accountId) {
      fetchaccountBalance();
    }
  }, [accountId, sdk]);

  const uniqueAddress = useMemo(
    () => accountId && Address.normalize.substrateAddress(accountId, 7391),
    [accountId]
  );

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!accountBalance) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Title>Account information</Title>
      <InfoList>
        <InfoItem>
          <span>Account address:</span> <span>{accountId}</span>
        </InfoItem>
        {currentAccount && (
          <InfoItem>Account name: {currentAccount.name}</InfoItem>
        )}
        {accountId && (
          <InfoItem>
            <span>Account mirror address:</span>
            <span>
              {Address.is.substrateAddress(accountId)
                ? Address.mirror.substrateToEthereum(accountId)
                : Address.mirror.ethereumToSubstrate(accountId)}
            </span>
          </InfoItem>
        )}
        <InfoItem>
          <span>Total balance:</span>{" "}
          <span>{accountBalance?.total / 10 ** accountBalance?.decimals}</span>
        </InfoItem>
        <InfoItem>
          <span>Transferable balance:</span>{" "}
          <span>
            {accountBalance?.available / 10 ** accountBalance?.decimals}
          </span>
        </InfoItem>
        {uniqueAddress && (
          <InfoItem>
            SubScan UI link:{" "}
            <a
              href={`https://unique.subscan.io/account/${uniqueAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {uniqueAddress}
            </a>
          </InfoItem>
        )}
        {uniqueAddress && (
          <InfoItem>
            Uniquescan UI link:{" "}
            <a
              href={`https://uniquescan.io/UNIQUE/account/${uniqueAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {uniqueAddress}
            </a>
          </InfoItem>
        )}
      </InfoList>
      <ButtonContainer>
        <Button>Owned collections</Button>
        <Button>Owned NFTs</Button>
      </ButtonContainer>
    </Container>
  );
};

export default AccountPage;
