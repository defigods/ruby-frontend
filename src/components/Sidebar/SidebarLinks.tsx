import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { darken } from 'polished';
import { getTokenAddress, useContract } from '../../utils';
import { useSelectedQuote } from '../../state/quotes/hooks';
import { useActiveWeb3React } from '../../hooks';
import { DAI_INTERFACE } from '../../constants/abis/dai';
import { FAUCET_ENABLED_IDS } from '../../config';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const activeClassName = 'ACTIVE';

const ActiveDot = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.tertiary};
  margin-right: 5px;
`;

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  color: ${({ theme }) => theme.text.secondary};
  // text-transform: uppercase;
  font-size: 15px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};

  &:not(.${activeClassName}) > ${ActiveDot} {
    display: none;
  }

  & > svg {
    color: ${({ theme }) => theme.text.tertiary};
  }

  &.${activeClassName} {
    color: ${({ theme }) => theme.text.primary};
  }

  &:hover:not(.${activeClassName}) {
    color: ${({ theme }) => darken(0.1, theme.text.secondary)};
  }
`;

const StyledNavLinkRamp = styled(NavLink).attrs({
  activeClassName,
})`
  color: #22bf73;
  // text-transform: uppercase;
  font-size: 15px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};

  &:not(.${activeClassName}) > ${ActiveDot} {
    display: none;
  }

  & > svg {
    color: ${({ theme }) => theme.text.tertiary};
  }

  &.${activeClassName} {
    color: ${({ theme }) => theme.text.primary};
  }

  &:hover:not(.${activeClassName}) {
    color: ${({ theme }) => darken(0.1, '#22bf73')};
  }
`;

export default function () {
  const quote = useSelectedQuote()!;
  const { chainId } = useActiveWeb3React();

  const quoteAddress = getTokenAddress(quote, chainId!);

  const contract = useContract(quoteAddress, DAI_INTERFACE)!;

  function faucet(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.stopPropagation();
    contract.functions.faucet().then(console.log);
  }

  return (
    <Wrapper>
      <StyledNavLink to="/portfolio">
        Portfolio
        <ActiveDot />
      </StyledNavLink>
      <StyledNavLink to="/trade">
        Trade
        <ActiveDot />
      </StyledNavLink>
      <StyledNavLink to="/history">
        History
        <ActiveDot />
      </StyledNavLink>
      {FAUCET_ENABLED_IDS.includes(chainId || -1) && (
        <StyledNavLink to="/faucet" onClick={faucet}>
          Faucet
        </StyledNavLink>
      )}
      <StyledNavLinkRamp to="/ramp">Buy Crypto</StyledNavLinkRamp>
    </Wrapper>
  );
}
