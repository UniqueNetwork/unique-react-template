import React, { useContext, useState } from 'react';
import { ethers } from 'ethers';
import { connectSdk } from '../sdk/connect';
import { baseUrl } from '../sdk/SdkContext';
import { AccountsContext } from '../accounts/AccountsContext';
import styled from 'styled-components';
import { SignerTypeEnum } from '../accounts/types';
import storageArtifacts from '../data/storage-artifacts.json';
import { useEthersSigner } from '../hooks/useSigner';
import { switchNetwork } from '../utils/swithChain';

export const EvmTest = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);
  const [storeValue, setStoreValue] = useState<string>('');
  const [checkingValue, setCheckingValue] = useState(false);
  const [storingValue, setStoringValue] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { selectedAccount } = useContext(AccountsContext);
  const signer = useEthersSigner();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
  };

  const handleDeployContract = async () => {
    if (!storageArtifacts.bytecode) {
      setErrorMessage('Bytecode is required for deployment');
      return;
    }

    if (!selectedAccount) {
      setErrorMessage('You need account');
      return;
    }

    try {
      setDeploying(true);

      if (selectedAccount?.signerType !== SignerTypeEnum.Ethereum) {
        const sdk = await connectSdk(baseUrl, selectedAccount);
        if (!sdk) return;

        const result = await sdk.evm.deploy(
          { bytecode: storageArtifacts.bytecode },
          { signerAddress: selectedAccount.address }
        );
        const deployedContractAddress = result.result.contractAddress;
        setContractAddress(deployedContractAddress);
        setErrorMessage(null);
        console.log(`Contract deployed at address: ${deployedContractAddress}`);
      } else if (selectedAccount?.signerType === SignerTypeEnum.Ethereum) {
        await switchNetwork();
        const factory = new ethers.ContractFactory(storageArtifacts.abi, storageArtifacts.bytecode, signer);

        const contract = await factory.deploy();
        await contract.waitForDeployment();
        const deployedContractAddress = await contract.getAddress();

        setContractAddress(deployedContractAddress);
        setErrorMessage(null);
        console.log(`Contract deployed via ethers at address: ${deployedContractAddress}`);
      }
    } catch (error) {
      console.error('Error deploying contract:', error);
      setErrorMessage('Error deploying contract');
    } finally {
      setDeploying(false);
    }
  };

  const handleStoreValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreValue(e.target.value);
  };

  const handleStoreCall = async () => {
    if (!contractAddress || !storageArtifacts.abi || !storeValue) {
      setErrorMessage('Contract address, ABI, and value are required');
      return;
    }

    try {
      setStoringValue(true);

      if (selectedAccount?.signerType !== SignerTypeEnum.Ethereum) {
        const sdk = await connectSdk(baseUrl, selectedAccount);
        const storeTx = await sdk.evm.send({
          functionName: 'store',
          functionArgs: [BigInt(storeValue)],
          contract: {
            address: contractAddress,
            abi: storageArtifacts.abi,
          },
        });

        if (storeTx.result.isSuccessful) {
          setErrorMessage(null);
          console.log('Store transaction successful!');
        }
      } else if (selectedAccount?.signerType === SignerTypeEnum.Ethereum) {
        await switchNetwork();
        const contract = new ethers.Contract(contractAddress, storageArtifacts.abi, signer);

        const tx = await contract.store(BigInt(storeValue));
        await tx.wait();
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error interacting with contract:', error);
      setErrorMessage('Error interacting with contract');
    } finally {
      setStoringValue(false);
    }
  };

  const handleCheckValue = async () => {
    if (!contractAddress || !storageArtifacts.abi) {
      setErrorMessage('Contract address and ABI are required');
      return;
    }

    try {
      setCheckingValue(true);

      if (selectedAccount?.signerType !== SignerTypeEnum.Ethereum) {
        const sdk = await connectSdk(baseUrl, selectedAccount);
        const result = await sdk.evm.call({
          functionName: 'retrieve',
          functionArgs: [],
          contract: {
            address: contractAddress,
            abi: storageArtifacts.abi,
          },
        });

        setRetrievedValue(result[0]?.toString() || 'No value returned');
        setErrorMessage(null);
      } else if (selectedAccount?.signerType === SignerTypeEnum.Ethereum) {
        await switchNetwork();
        const contract = new ethers.Contract(contractAddress, storageArtifacts.abi, signer);

        const result = await contract.retrieve();
        setRetrievedValue(result?.toString() || 'No value returned');
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error retrieving value from contract:', error);
      setErrorMessage('Error retrieving value from contract');
    } finally {
      setCheckingValue(false);
    }
  };

  return (
    <StyledWrapper>
      <h2>EVM TEST</h2>

      {errorMessage && <StyledError>{errorMessage}</StyledError>}

      <StyledButton onClick={handleDeployContract} disabled={deploying}>
        {deploying ? 'Deploying...' : 'Deploy Contract'}
      </StyledButton>

      <StyledInput
        type="text"
        placeholder="Enter Contract Address"
        value={contractAddress}
        onChange={handleAddressChange}
      />

      <StyledInput
        type="number"
        placeholder="Enter Value to Store"
        value={storeValue}
        onChange={handleStoreValueChange}
      />

      <StyledButton onClick={handleStoreCall} disabled={storingValue || !contractAddress || !storeValue}>
        {storingValue ? 'Storing...' : 'Store Value'}
      </StyledButton>

      <StyledButton onClick={handleCheckValue} disabled={checkingValue || !contractAddress}>
        {checkingValue ? 'Checking...' : 'Check Value'}
      </StyledButton>

      {retrievedValue !== null && (
        <StyledResult>Retrieved Value from contract: {retrievedValue}</StyledResult>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  padding: 20px;
  background-color: #1f1f1f;
  border-radius: 10px;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;

  h2 {
    color: #fff;
    margin-top: 0;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #2c2c2c;
  border: 1px solid #3a3a3a;
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
`;

const StyledResult = styled.p`
  color: #fff;
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
`;

const StyledError = styled.p`
  color: #ff4d4d;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
`;
