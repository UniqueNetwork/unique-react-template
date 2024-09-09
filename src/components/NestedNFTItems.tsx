import React from "react";
import styled from "styled-components";
import NestedNftItem from "./NestedNftItem";
import { TokenData } from "../pages/TokenPage";

const NestedNftGrid = styled.div`
  display: flex;
  overflow: scroll;
  gap: 20px;
  width: 100%;
  justify-items: center;
`;

interface NestedNftItemsProps {
  children: TokenData[];
}

const NestedNftItems: React.FC<NestedNftItemsProps> = ({ children }) => {
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <NestedNftGrid>
      {children.map((child, index) => (
        <NestedNftItem key={index} child={child} isNested={true} />
      ))}
    </NestedNftGrid>
  );
};

export default NestedNftItems;
