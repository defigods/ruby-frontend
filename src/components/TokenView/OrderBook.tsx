import React from 'react';
import styled from 'styled-components';
import { useSelectedToken } from '../../state/tokens/hooks';

const Wrapper = styled.div``;

export default function () {
  const token = useSelectedToken();

  return <Wrapper>test</Wrapper>;
}
