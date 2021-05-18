import React, { useCallback, useContext } from 'react';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import Loader from '../Loader';
import coinbaseWalletLogo from '../../assets/img/coinbaseWalletLogo1.png';
import walletConnectLogo from '../../assets/img/walletconnect-logo.png';
import logo from '../../assets/img/logo-color.png';
import { walletLink, walletConnect } from '../../connectors';
import { useWebSocket } from '../SocketProvider';
import MetaMaskConnector from './Metamask';
import { NoEthereumProviderError } from '@web3-react/injected-connector';

Modal.setAppElement('#root');

const MainButton = styled.div`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.text.againstRed};
  width: 80%;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  padding: 15px 0;
  margin: auto;
  margin-bottom: 15px;
  margin-top: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease-in;
  &:hover {
    opacity: 0.8;
  }
`;

const LogoWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 30px 50px 30px 50px;
  display: flex;
  justify-content: center;
`;

const TextWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 8px 20px 8px 20px;
  text-align: center;
  justify-content: center;
`;

const WalletOptionWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  padding: 20px 50px 20px 50px;
  display: flex;
  justify-content: center;
  div {
    cursor: pointer;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
`;

const CoinbaseWallet = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
`;

const WalletConnect = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
  padding: 21px 10px 21px 10px;
`;

function useModalStyle(): Modal.Styles {
  const theme = useContext(ThemeContext);

  return {
    content: {
      maxHeight: '95%',
      overflowY: 'auto',
      width: '24.5rem',
      top: '50%',
      bottom: 'none',
      left: '50%',
      padding: '0',
      transform: 'translate(-50%, -50%)',
      border: `1px solid ${theme.colors.secondary}`,
      background: theme.colors.primary,
    },
    overlay: {
      zIndex: 5,
      backgroundColor: theme.colors.modalBackground,
    },
  };
}

// TODO: Apply DRY principle on Connectors

function WalletLinkConnector() {
  const { activate } = useActiveWeb3React();

  const connect = useCallback(() => {
    activate(walletLink, undefined, true).catch((err) => {
      console.error(`Failed to activate account using walletLink`, err);
    });
  }, [activate]);

  return (
    <WalletOptionWrapper>
      <div onClick={connect}>
        <CoinbaseWallet src={coinbaseWalletLogo} alt="Coinbase" />
      </div>
    </WalletOptionWrapper>
  );
}

function WalletConnectConnector() {
  const { activate } = useActiveWeb3React();

  const connect = useCallback(() => {
    activate(walletConnect, undefined, true).catch((err) => {
      console.error(`Failed to activate account using walletConnect`, err);
      if (err instanceof NoEthereumProviderError) {
      }
    });
  }, [activate]);

  return (
    <WalletOptionWrapper>
      <div onClick={connect}>
        <WalletConnect src={walletConnectLogo} alt="WalletConnect" />
      </div>
    </WalletOptionWrapper>
  );
}

export default function () {
  const modalStyle = useModalStyle();
  const websocket = useWebSocket();

  function renderModal() {
    if (websocket.loading) {
      return (
        <TextWrapper>
          <Loader size="100px" />
        </TextWrapper>
      );
    } else {
      return (
        <>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>
              To trade on Rubicon and connect to the Ethereum blockchain, please
              connect your wallet.
            </p>
            <MetaMaskConnector />
            <WalletLinkConnector />
            <WalletConnectConnector />
          </TextWrapper>
        </>
      );
    }
  }

  return (
    <Modal isOpen={true} style={modalStyle}>
      <LogoWrapper>
        <Logo src={logo} alt="logo" />
      </LogoWrapper>
      {renderModal()}
    </Modal>
  );
}
