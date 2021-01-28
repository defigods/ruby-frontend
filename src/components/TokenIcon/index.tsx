import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Token } from '../../types';
import unknown from '../../assets/img/unknown-icon.svg';

interface TokenIconProps {
  token: Token;
  size?: string;
}

const DEFAULT_SIZE = '30px';

const Container = styled.div<{ size: string }>`
  border-radius: 50%;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  display: flex;
`;

const Image = styled.img`
  height: 100%;
  width: 100%;
`;

export default function ({ token, size }: TokenIconProps) {
  return (
    <Container size={size || DEFAULT_SIZE}>
      <Image src={token.logo || unknown} alt="Icon" />
    </Container>
  );
}