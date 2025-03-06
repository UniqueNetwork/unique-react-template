import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccountsContext } from "../accounts/AccountsContext";
import { Address } from "@unique-nft/utils";
import TokenList from "../components/TokenList/TokenList";
import { useSdkContext } from "../sdk/SdkContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
`;

const Title = styled.h3`
  margin-bottom: 16px;
  text-align: left;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InfoItem = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  width: 80%;
  justify-content: space-between;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const SingleAccountPage = () => {
  const { accounts } = useAccountsContext();
  const accountsArray = Array.from(accounts.values());

  const { sdk } = useSdkContext();
  const { accountId } = useParams<{ accountId: string }>();
  const currentAccount = useMemo(
    () => accountsArray.find((acc) => acc.address === accountId),
    [accountId, accountsArray]
  );
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountBalance = async () => {
      if (!sdk || !accountId) return;
      try {
        const address = !Address.is.ethereumAddress(accountId || '')
          ? accountId
          : Address.mirror.ethereumToSubstrate(accountId || '');
        console.log(address, 'ADDRESS');
        

        const balance = await sdk.balance.get({ address });

        // const tokens = await sdk.account.
        setAccountBalance(balance);
      } catch (error) {
        setError("Failed to fetch account data. Please try again later.");
      }
    };

      fetchAccountBalance();
  }, [accountId, sdk]);

  const uniqueAddress = useMemo(
    () =>
      accountId && !Address.is.ethereumAddress(accountId)
        ? Address.normalize.substrateAddress(accountId, 7391)
        : Address.mirror.ethereumToSubstrate(accountId || ""),
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
        {uniqueAddress && (
          <InfoItem>
            <span>Account mirror address:</span>
            <span>{uniqueAddress}</span>
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
              href={`${process.env.REACT_APP_SUBSCAN_LINK}account/${uniqueAddress}`}
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
              href={`${process.env.REACT_APP_UNIQUESCAN_LINK}account/${uniqueAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {uniqueAddress}
            </a>
          </InfoItem>
        )}
      </InfoList>
      <Title>Account NFTs</Title>
      <TokenList />
    </Container>
  );
};

export default SingleAccountPage;
