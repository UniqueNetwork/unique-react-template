import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { TypeSelector, SearchType } from './TypeSelector';

interface SearchInputProps {
  position?: 'left' | 'right' | 'full';
}

interface InputGroupProps {
  type?: 'nft';
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SearchInput = styled.input<SearchInputProps>`
  padding: 10px 20px !important;
  border: none;
  background-color: #d8d8d8;
  font-size: 16px;
  color: #000000;
  border-radius: 10px;
  width: ${props => props.position === 'full' ? '100%' : '50% !important'};
  flex: ${props => props.position === 'full' ? 2 : 1};

  &::placeholder {
    color: #777777;
  }

  ${({ position }) => position === 'left' && `
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  `}

  ${({ position }) => position === 'right' && `
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 1px solid #b8b8b8;
  `}
`;

const SearchButton = styled.button`
  padding: 10px 30px;
  border: none;
  border-radius: 10px;
  background-color: #0063a6;
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
  min-width: 120px;

  &:hover {
    opacity: 0.9;
  }
`;

const InputGroup = styled.div<InputGroupProps>`
  height: 40px;
  min-width: 350px;
  display: flex;
  flex: 2;

  ${({ type }) => type === 'nft' && `
    background-color: #d8d8d8;
    border-radius: 10px;
    overflow: hidden;
  `}
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const TypeSelectorWrapper = styled.div`
  max-width: 140px;
`;

export const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchType, setSearchType] = useState<SearchType>('account');
  const [accountId, setAccountId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [tokenId, setTokenId] = useState('');

  // Initialize form state from URL only on component mount
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'token' && pathParts.length === 3) {
      setSearchType('nft');
      setCollectionId(pathParts[1]);
      setTokenId(pathParts[2]);
    } else if (pathParts[0] === 'collection' && pathParts.length === 2) {
      setSearchType('collection');
      setCollectionId(pathParts[1]);
    } else if (pathParts[0] === 'account' && pathParts.length === 2) {
      setSearchType('account');
      setAccountId(pathParts[1]);
    } else {
      // Default to 'account' if the URL doesn't match any known pattern
      setSearchType('account');
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newUrl = '';
    switch (searchType) {
      case 'account':
        if (accountId) newUrl = `/account/${accountId}`;
        break;
      case 'collection':
        if (collectionId) newUrl = `/collection/${collectionId}`;
        break;
      case 'nft':
        if (collectionId && tokenId) newUrl = `/token/${collectionId}/${tokenId}`;
        break;
    }

    if (newUrl) {
      navigate(newUrl);
    }
  };

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    if (type !== 'nft') {
      setTokenId('');
    }
    if (type === 'account') {
      setCollectionId('');
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <SearchContainer>
        <FormRow>
          <InputGroup type={searchType === 'nft' ? 'nft' : undefined}>
            {searchType === 'account' && (
              <SearchInput
                type="text"
                placeholder="Account address"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                position="full"
              />
            )}
            {searchType === 'collection' && (
              <SearchInput
                type="text"
                placeholder="Collection ID"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                position="full"
              />
            )}
            {searchType === 'nft' && (
              <>
                <SearchInput
                  type="text"
                  placeholder="Enter collection ID"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  position="left"
                />
                <SearchInput
                  type="text"
                  placeholder="NFT ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  position="right"
                />
              </>
            )}
          </InputGroup>
          <SearchButton type="submit">Search</SearchButton>
        </FormRow>
        <TypeSelectorWrapper>
          <TypeSelector value={searchType} onChange={handleTypeChange} />
        </TypeSelectorWrapper>
      </SearchContainer>
    </form>
  );
};

