import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { darken } from 'polished';

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

export default function () {
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
    </Wrapper>
  );
}
