import React, { useState } from 'react';
import styled from 'styled-components';
import { Token } from '../../types';
import SearchBar from './SearchBar';
import TokenListItem from './TokenListItem';

interface TokenListProps {
  data: (Token & { title: string; subtitle: string })[];
}

const Wrapper = styled.div`
  width: 50vw;
  height: 100vh;
  min-width: 300px;
`;

export default function (props: TokenListProps) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const filteredData = search
    ? props.data.filter((item) => {
        return (
          item.ticker.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      })
    : props.data;

  return (
    <Wrapper>
      <SearchBar
        placeholder="Search by token or company name"
        onSearch={(s) => setSearch(s)}
      ></SearchBar>
      {filteredData.map((item) => (
        <TokenListItem {...item} key={item.title} />
      ))}
    </Wrapper>
  );
}
