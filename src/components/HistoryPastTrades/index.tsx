import React, { useMemo } from 'react';
import styled from 'styled-components';
import Loader, { LoaderWrapper } from '../Loader';
import PastTradeItem from './PastTradeItem';
import { useUserTrades } from '../../hooks/trades';
import { useSelectedToken } from '../../state/tokens/hooks';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  align-items: center;
  width: 100%;
  text-align: center;
  padding: 20px;
  font-weight: bold;
`;

const BodyWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0 10%;
  flex-direction: column;
  overflow-y: scroll;
`;

const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  color: ${({ theme }) => theme.text.secondary};
`;

const ContentWrapper = styled.div`
  overflow-y: scroll;
  display: flex;
  flex-direction: column;

  ::-webkit-scrollbar {
    width: 0px;
  }
`;

export default function () {
  const [data, loading] = useUserTrades();
  const selectedToken = useSelectedToken();

  const sortedTrades = useMemo(() => {
    // here, create the History data
    if (!selectedToken || loading) {
      return [];
    }

    const { buys, sells } = data[selectedToken.ticker];

    return [...buys, ...sells].sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedToken, loading, data]);

  return (
    <Wrapper>
      <Header>Trade History</Header>
      <BodyWrapper>
        <TableHeader>
          {['Token', 'Action', 'Size', 'Timestamp', 'Details'].map((item) => (
            <span style={{ width: '20%', textAlign: 'center' }} key={item}>
              {item}
            </span>
          ))}
        </TableHeader>
        <ContentWrapper>
          {loading ? (
            <LoaderWrapper style={{ paddingTop: '30px' }}>
              <Loader size="50px" />
            </LoaderWrapper>
          ) : (
            <>
              {sortedTrades.map((trade, idx) => (
                <PastTradeItem data={trade} key={idx} />
              ))}
            </>
          )}
        </ContentWrapper>
      </BodyWrapper>
    </Wrapper>
  );
}
