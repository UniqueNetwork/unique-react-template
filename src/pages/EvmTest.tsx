import React, { useContext, useState } from 'react';
import { connectSdk } from '../sdk/connect';
import { baseUrl } from '../sdk/SdkContext';
import { AccountsContext } from '../accounts/AccountsContext';
import styled from 'styled-components';

export const EvmTest = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [storageJson, setStorageJson] = useState('');
  const [parsedStorage, setParsedStorage] = useState<{ bytecode?: string; abi?: any[] }>({});
  const [deploying, setDeploying] = useState(false);
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null);
  const [storeValue, setStoreValue] = useState<string>('');
  const [checkingValue, setCheckingValue] = useState(false);
  const [storingValue, setStoringValue] = useState(false);
  
  const { selectedAccount } = useContext(AccountsContext);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
  };

  const handleStorageJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStorageJson(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setParsedStorage(parsed);
    } catch (err) {
      console.error('Invalid JSON');
    }
  };

  const handleDeployContract = async () => {
    if (!parsedStorage.bytecode) {
      console.error('Bytecode is required for deployment');
      return;
    }
    try {
      const sdk = await connectSdk(baseUrl, selectedAccount);
      setDeploying(true);
      const result = await sdk.evm.deploy({
        bytecode: parsedStorage.bytecode,
      }, { signerAddress: selectedAccount?.address || '' });

      const deployedContractAddress = result.result.contractAddress;
      setContractAddress(deployedContractAddress);
      console.log(`Contract deployed at address: ${deployedContractAddress}`);
    } catch (error) {
      console.error('Error deploying contract:', error);
    } finally {
      setDeploying(false);
    }
  };

  const handleStoreValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreValue(e.target.value);
  };

  const handleStoreCall = async () => {
    if (!contractAddress || !parsedStorage.abi || !storeValue) {
      console.error('Contract address, ABI, and value are required');
      return;
    }
    try {
      const sdk = await connectSdk(baseUrl, selectedAccount);
      setStoringValue(true);

      const storeTx = await sdk.evm.send({
        functionName: 'store',
        functionArgs: [BigInt(storeValue)],
        contract: {
          address: contractAddress,
          abi: parsedStorage.abi,
        },
      });

      if (storeTx.result.isSuccessful) {
        console.log('Store transaction successful!');
      }
    } catch (error) {
      console.error('Error interacting with contract:', error);
    } finally {
      setStoringValue(false);
    }
  };

  const handleCheckValue = async () => {
    if (!contractAddress || !parsedStorage.abi) {
      console.error('Contract address and ABI are required');
      return;
    }

    try {
      const sdk = await connectSdk(baseUrl, selectedAccount);
      setCheckingValue(true);

      const result = await sdk.evm.call({
        functionName: 'retrieve',
        functionArgs: [],
        contract: {
          address: contractAddress,
          abi: parsedStorage.abi,
        },
      });

      setRetrievedValue(result[0]?.toString() || 'No value returned');
      console.log('Retrieved value:', result[0]?.toString());
    } catch (error) {
      console.error('Error retrieving value from contract:', error);
    } finally {
      setCheckingValue(false);
    }
  };

  return (
    <StyledWrapper>
      <h2>EVM TEST</h2>

      <StyledTextArea
        placeholder="Paste storage JSON (bytecode and abi)"
        value={storageJson}
        onChange={handleStorageJsonChange}
        rows={10}
      />
      
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
		color: #FFF;
		margin-top: 0;
	}
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background-color: #2c2c2c;
  border: 1px solid #3a3a3a;
  color: #fff;
  font-size: 16px;
  margin-bottom: 15px;
	box-sizing: border-box;
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
