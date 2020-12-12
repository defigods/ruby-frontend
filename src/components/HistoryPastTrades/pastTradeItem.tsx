import React from 'react';
import styled from 'styled-components';

interface pastTradeItemProps {
  token: string;
  action: string;
  size: number;
  details: string;
}

const Wrapper = styled.div`
  height: 50px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.tertiary};
  border-radius: 5px;
  padding: 10px 0 10px 0;
  margin: 10px 0 10px 0;
  display: inline-flex;
`;

const TextItem = styled.div`
  padding: 0px 130px 0px 130px;
`;

const TextItemStart = styled.div`
  padding: 0px 110px 0px 40px;
`;

const TextItemEnd = styled.div`
  padding: 0px 40px 0px 50px;
`;

export default function (props: pastTradeItemProps) {
  return (
    <Wrapper>
      <TextItemStart>{props.token}</TextItemStart>
      <TextItem>{props.action}</TextItem>
      <TextItem>{props.size}</TextItem>
      <TextItemEnd>{props.details}</TextItemEnd>
    </Wrapper>
  );
}
