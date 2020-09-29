import { lighten } from 'polished';
import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  // height: 100%;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
`;

const HeaderChild = styled.div`
  width: 50%;
  display: flex;
  justify-content: space-around;
  padding-bottom: 5px;
  // background-color: ${({ theme }) => lighten(0.02, theme.colors.secondary)};

  &:first-child {
    border-right: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const HeaderItem = styled.span`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  // height: 100%;
  overflow-y: scroll;
`;

const BodyChild = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  &:first-child {
    border-right: 2px dotted ${({ theme }) => theme.colors.primary};
  }
`;

const BodyRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 10%;
`;

const BodyItem = styled.span`
  font-size: 11px;
`;

const Ask = (props: { quantity: number; price: number }) => {
  const theme = useContext(ThemeContext);
  return (
    <BodyRow>
      <BodyItem style={{ color: theme.text.red }}>
        ${props.price.toFixed(2)}
      </BodyItem>
      <BodyItem>{props.quantity.toFixed(4)}</BodyItem>
    </BodyRow>
  );
};

const Bid = (props: { quantity: number; price: number }) => {
  const theme = useContext(ThemeContext);
  return (
    <BodyRow>
      <BodyItem>{props.quantity.toFixed(4)}</BodyItem>
      <BodyItem style={{ color: theme.text.green }}>
        ${props.price.toFixed(2)}
      </BodyItem>
    </BodyRow>
  );
};

export default function () {
  const token = useSelectedToken();

  if (!token) return null;

  return (
    <Wrapper>
      <HeaderWrapper>
        <HeaderChild>
          <HeaderItem>Size</HeaderItem>
          <HeaderItem>Bid</HeaderItem>
        </HeaderChild>
        <HeaderChild>
          <HeaderItem>Ask</HeaderItem>
          <HeaderItem>Size</HeaderItem>
        </HeaderChild>
      </HeaderWrapper>
      <BodyWrapper>
        <BodyChild>
          {token.bids.map((data, idx) => (
            <Bid {...data} key={idx} />
          ))}
        </BodyChild>
        <BodyChild>
          {token.asks.map((data, idx) => (
            <Ask {...data} key={idx} />
          ))}
        </BodyChild>
      </BodyWrapper>
    </Wrapper>
  );
}
