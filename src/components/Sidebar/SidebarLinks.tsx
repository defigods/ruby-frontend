import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { darken } from 'polished';
import { Crosshair } from 'react-feather';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const activeClassName = 'ACTIVE';

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

  &:not(.${activeClassName}) > svg {
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

export default function () {
  return (
    <Wrapper>
      <StyledNavLink to="/portfolio">
        Portfolio
        <Crosshair size={20} />
      </StyledNavLink>
      <StyledNavLink to="/trade">
        Trade
        <Crosshair size={20} />
      </StyledNavLink>
      <StyledNavLink to="/history">
        History
        <Crosshair size={20} />
      </StyledNavLink>
    </Wrapper>
  );
}
