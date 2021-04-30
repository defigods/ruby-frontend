import React, { useCallback, useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled, { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import Loader from '../Loader';
import mmLogo from '../../assets/img/metamask.svg';
import coinbaseWalletLogo from '../../assets/img/coinbaseWalletLogo1.png';
import walletConnectLogo from '../../assets/img/walletconnect-logo.png';
import logo from '../../assets/img/logo-color.png';
import { injected, walletlink, walletConnect } from '../../connectors';
import { useWebSocket } from '../SocketProvider';
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
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
`;

const MM = styled.img`
  width: 100%;
  height: 85px;
  background-color: white;
  border-radius: 10px;
  border: 0.5px solid black;
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

export default function () {
  const modalStyle = useModalStyle();
  const { active, activate } = useActiveWeb3React();

  const [hasWallet, setHasWallet] = useState(true);
  const [hasTried, setHasTried] = useState(false);

  const websocket = useWebSocket();

  const connect = useCallback(() => {
    // LOGIC to connect to wallet
    // User should see the modal overlaying the main app
    setHasTried(true);
    activate(injected, undefined, true).catch((err) => {
      console.error(`Failed to activate account`, err);
      setHasWallet(false);
      if (err instanceof NoEthereumProviderError) {
      }
    });
  }, [activate]);

  useEffect(() => {
    if (!hasTried) {
      connect();
    }
  }, [hasTried, connect]);

  //Logic to use walletlink and connect to coinbase wallet
  //https://github.com/walletlink/walletlink

  const walletlinkcall = useCallback(() => {
    // LOGIC to connect to wallet
    // User should see the modal overlaying the main app
    setHasTried(true);
    activate(walletlink, undefined, true).catch((err) => {
      console.error(`Failed to activate account`, err);
      if (err instanceof NoEthereumProviderError) {
        setHasWallet(false);
      }
    });
  }, [activate]);

  useEffect(() => {
    if (!hasTried) {
      connect();
    }
  }, [hasTried, connect]);

  const walletConnectCall = useCallback(() => {
    // LOGIC to connect to wallet
    // User should see the modal overlaying the main app
    setHasTried(true);
    activate(walletConnect, undefined, true).catch((err) => {
      console.error(`Failed to activate account`, err);
      if (err instanceof NoEthereumProviderError) {
        setHasWallet(false);
      }
    });
  }, [activate]);

  useEffect(() => {
    if (!hasTried) {
      connect();
    }
  }, [hasTried, connect]);

  function renderModal() {
    if (websocket.loading || (!hasTried && !active)) {
      return (
        <TextWrapper>
          <Loader size="100px" />
        </TextWrapper>
      );
    } else if (hasTried && !active && hasWallet) {
      return (
        <>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>Please connect your browser wallet to begin trading.</p>
          </TextWrapper>
          <MainButton onClick={connect}>CONNECT</MainButton>
        </>
      );
    } else {
      // they don't have an extension
      return (
        <>
          <TextWrapper>
            <h2>Welcome to Rubicon</h2>
            <p>
              To trade on Rubicon and connect to the Ethereum blockchain, please
              install a browser wallet.
            </p>
            <WalletOptionWrapper>
              <a
                href={'https://metamask.io/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MM src={mmLogo} alt="Metamask" />
              </a>
            </WalletOptionWrapper>
            <WalletOptionWrapper>
              <a
                // href={'https://wallet.coinbase.com/'}
                // target="_blank"
                // rel="noopener noreferrer"
                onClick={walletlinkcall}
              >
                <CoinbaseWallet src={coinbaseWalletLogo} alt="Coinbase" />
              </a>
            </WalletOptionWrapper>
            <WalletOptionWrapper>
              <a onClick={walletConnectCall}>
                <WalletConnect src={walletConnectLogo} alt="WalletConnect" />
              </a>
            </WalletOptionWrapper>
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
