import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SelectWrapper = styled.div`
  position: relative;
  min-width: 140px;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 8px 20px;
  background: transparent;
  border: 1px solid #000000;
  border-radius: 8px;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  color: #000000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: white;

  &:hover {}
`;

const DropdownList = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% - 4px);
  left: 0;
  width: calc(100% - 1px);
  background: white;
  border: 1px solid #000000;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 10;
`;

const Option = styled.div<{ isSelected: boolean }>`
  padding: 8px 20px;
  cursor: pointer;
  background: ${props => props.isSelected ? 'rgba(0, 0, 0, 0.05)' : 'transparent'};
  color: #000000;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const ArrowIcon = styled.svg<{ isOpen: boolean }>`
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.2s ease;
  min-width: 17px;
`;

export type SearchType = 'account' | 'collection' | 'nft';

interface TypeSelectorProps {
  value: SearchType;
  onChange: (value: SearchType) => void;
}

const options = [
  { value: 'account', label: 'Account' },
  { value: 'collection', label: 'Collection' },
  { value: 'nft', label: 'NFT' }
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <SelectWrapper ref={wrapperRef}>
      <SelectButton type="button" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption?.label}
        <ArrowIcon 
          width="17" 
          height="9" 
          viewBox="0 0 17 9" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          isOpen={isOpen}
        >
          <path 
            d="M15.6106 2.71312e-07L17 1.33853L9.42799 8.62916C9.30666 8.74668 9.16238 8.83995 9.00345 8.90359C8.84453 8.96723 8.6741 9 8.50197 9C8.32983 9 8.1594 8.96723 8.00048 8.90359C7.84155 8.83995 7.69728 8.74668 7.57595 8.62916L-3.34893e-07 1.33853L1.38936 0.0012626L8.5 6.84403L15.6106 2.71312e-07Z" 
            fill="black"
          />
        </ArrowIcon>
      </SelectButton>
      <DropdownList isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            isSelected={option.value === value}
            onClick={() => {
              onChange(option.value as SearchType);
              setIsOpen(false);
            }}
          >
            {option.label}
          </Option>
        ))}
      </DropdownList>
    </SelectWrapper>
  );
};

