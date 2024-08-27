import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PaginationComponent from "./Pagination";
import NestedNftItem from "../NestedNftItem";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
`;

const TokenListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const TokenList = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  const queryParams = new URLSearchParams(location.search);
  const page = parseInt(queryParams.get("page") || "1", 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  const totalPages = Math.ceil(totalTokens / limit);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          //Local - using cors anywhere
          //`http://localhost:7654/https://rest.uniquenetwork.dev/scan/v2/unique/nfts?topmostOwnerIn=${accountId}&offset=${offset}&limit=${limit}`,
          `https://rest.uniquenetwork.dev/scan/v2/unique/nfts?topmostOwnerIn=${accountId}&offset=${offset}&limit=${limit}`,
          {
            headers: { accept: "application/json" },
          }
        );
        const data = await response.json();
        setTokens(data.items);
        setTotalTokens(data.count);
      } catch (error) {
        setError("Failed to fetch tokens. Please try again later.");
      }
      setLoading(false);
    };

    if (accountId) {
      fetchTokens();
    }
  }, [accountId, page]);

  const handlePageChange = (newPage: number) => {
    queryParams.set("page", newPage.toString());
    navigate({ search: queryParams.toString() });
  };

  if (loading) return <div>Loading tokens...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <h3>User NFTs:</h3>
      <TokenListContainer>
        {tokens?.length > 0 ? (
          tokens.map((child, index) => (
            <NestedNftItem key={index} child={child} isNested={false} />
          ))
        ) : (
          <div>No NFTs found for this account.</div>
        )}
      </TokenListContainer>
      <PaginationComponent
        totalPages={totalPages}
        currentPage={page}
        onPageChange={handlePageChange}
      />
    </Container>
  );
};

export default TokenList;
