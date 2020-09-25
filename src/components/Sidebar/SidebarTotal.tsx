import React from 'react';
import styled from 'styled-components';
import CountUp from 'react-countup';

const Wrapper = styled.div`
  flex-direction: column;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  padding-bottom: 15px;
`;

const Label = styled.span`
  text-transform: uppercase;
  font-size: 12px;
  margin-bottom: 3px;
  color: ${({ theme }) => theme.text.secondary};
`;

const UserTotal = styled.span`
  font-size: 22px;
  font-weight: 600;
`;

export default function () {
  // TODO
  const userTotal = 245940.02;

  return (
    <Wrapper>
      <Label>Portfolio Total:</Label>
      <UserTotal>
        <CountUp end={userTotal} decimals={2} prefix="$" separator="," />
      </UserTotal>
    </Wrapper>
  );
}
