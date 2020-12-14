import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUserTokens } from '../../state/user/hooks';
import HoldingsItem from './HoldingsItem';
import HoldingsSwitch from './HoldingsSwitch';

const Wrapper = styled.div`
  margin: 10px 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Header = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const TableHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary};

  & > *:last-child {
    text-align: right;
  }
`;

const TableHeaderItem = styled.span<{ width: number }>`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  width: ${({ width }) => width}%;
`;

const TableContent = styled.div`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0px;
  }
`;

export default function () {
  const userTokens = useUserTokens();

  const [useDollars, setUseDollars] = useState(true);

  const percentages = useMemo(() => {
    const totalHoldings = userTokens.reduce(
      (accum, next) => (accum += next.quantity * next.currentPrice),
      0,
    );

    return userTokens.reduce<{ [ticker: string]: number }>(
      (accum, next) => ({
        ...accum,
        [next.ticker]: (next.quantity * next.currentPrice) / totalHoldings,
      }),
      {},
    );
  }, [userTokens]);

  return (
    <Wrapper>
      <HeaderWrapper>
        <Header>Total Holdings</Header>
        <HoldingsSwitch
          isActive={useDollars}
          toggle={() => setUseDollars(!useDollars)}
        />
      </HeaderWrapper>
      <TableHeader>
        <TableHeaderItem width={50}>Asset</TableHeaderItem>
        <TableHeaderItem width={25}>Price</TableHeaderItem>
        <TableHeaderItem width={25}>Holding</TableHeaderItem>
      </TableHeader>
      <TableContent>
        {userTokens.map((token) => (
          <HoldingsItem
            token={token}
            key={token.ticker}
            percentage={useDollars ? undefined : percentages[token.ticker]}
          />
        ))}
      </TableContent>
    </Wrapper>
  );
}
