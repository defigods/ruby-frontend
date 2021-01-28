import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../../assets/img/logo-text.png';
import SidebarLinks from './SidebarLinks';
import SidebarTotal from './SidebarTotal';
import SidebarUser from './SidebarUser';
import UserSettings from '../UserSettings';
import { useActiveWeb3React } from '../../hooks';

// TODO: optimize for mobile
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 180px;
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const LogoWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.logoBackground};
  width: 100%;
  padding: 8px 20px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  height: 55px;

  a {
    height: 0;
  }
`;

const Logo = styled.img`
  width: 100%;
`;

const ContentWrapper = styled.div`
  padding: 10px 20px;
`;

export default function () {
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const { account } = useActiveWeb3React();

  return (
    <Wrapper>
      <LogoWrapper>
        <Link to="/trade">
          <Logo src={logo} alt="logo" />
        </Link>
      </LogoWrapper>
      <ContentWrapper>
        <SidebarTotal />
        <SidebarLinks />
      </ContentWrapper>
      {!!account && <SidebarUser onOpen={() => setUserSettingsOpen(true)} />}
      <UserSettings
        isOpen={userSettingsOpen}
        onRequestClose={() => setUserSettingsOpen(false)}
      />
    </Wrapper>
  );
}
