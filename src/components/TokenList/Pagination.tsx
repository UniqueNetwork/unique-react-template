import React from "react";
import styled from "styled-components";

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  margin: 0 5px;
  padding: 10px 14px;
  border: none;
  background-color: ${({ active }) => (active ? "#0056b3" : "#007bff")};
  color: white;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  margin: 0 5px;
  padding: 10px 14px;
  color: #555;
`;

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <PaginationContainer>
      {getPageNumbers().map((page, index) =>
        page === "ellipsis" ? (
          <Ellipsis key={index}>...</Ellipsis>
        ) : (
          <PageButton
            key={page}
            active={currentPage === page}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </PageButton>
        )
      )}
    </PaginationContainer>
  );
};

export default PaginationComponent;
