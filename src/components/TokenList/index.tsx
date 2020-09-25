import React from 'react';
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
  return (
    <Wrapper>
      <SearchBar placeholder="Search by token or company name"></SearchBar>
      {props.data.map((item) => (
        <TokenListItem {...item} key={item.title} />
      ))}
    </Wrapper>
  );
}
