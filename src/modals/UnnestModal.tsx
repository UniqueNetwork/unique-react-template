import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountsContext } from "../accounts/AccountsContext";
import { Account } from "../accounts/types";
import { Modal } from "../components/Modal";
import { connectSdk } from "../sdk/connect";
import { ContentWrapper } from "./NestModal";
import { baseUrl } from "../sdk/SdkContext";
import styled from "styled-components";

type UnnestTModalProps = {
  isVisible: boolean;
  account?: Account;
  onClose(): void;
};

export const UnnestTModal = ({ isVisible, onClose }: UnnestTModalProps) => {
  const { selectedAccount } = useContext(AccountsContext);

  const { tokenId, collectionId } = useParams<{
    tokenId: string;
    collectionId: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);

  const onSign = async () => {
    if (!selectedAccount || !collectionId || !tokenId) return;
    setIsLoading(true);

    try {
      //@ts-ignore
      const sdk = await connectSdk(baseUrl, selectedAccount);

      await sdk?.token.unnest({
        nested: {
          collectionId,
          tokenId: +tokenId,
        },
      });

      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Transfer failed:", error);
      setIsLoading(false);
      alert(error);
    }
  };

  return (
    <Modal isVisible={isVisible} isFlexible={true} onClose={onClose}>
      <ContentWrapper>
        <h3>Confirm unnest this token</h3>
        {isLoading && <Loading>Transferring...</Loading>}
        <ButtonWrapper>
          <Button onClick={onSign} disabled={isLoading}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ButtonWrapper>
      </ContentWrapper>
    </Modal>
  );
};

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

export const Loading = styled.div`
  min-width: 320px;
  display: flex;
  justify-content: space-between;
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  font-size: 16px;
  width: 160px;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;