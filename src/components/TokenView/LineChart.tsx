import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { DefaultTheme, ThemeContext } from 'styled-components';
import { getSortedPrices } from '../../utils';

interface LineChartProps {
  data?: { [timestamp: number]: number };
}

const Wrapper = styled.div`
  width: calc(100% - 40px);
  height: 300px;
  margin: 0 20px;
  padding-top: 40px;
`;

const StyledSVG = styled.svg`
  height: 100%;
  width: 100%;

  polyline {
    height: 100%;
    width: 100%;
  }
`;

const createLine = (yValue: number, theme: DefaultTheme, rect?: DOMRect) => {
  const NUM_POINTS = 50;
  if (!rect) return null;

  const points = [...new Array(NUM_POINTS)].map((_, idx) => [
    (idx / NUM_POINTS) * (rect.width || 0),
    yValue,
  ]);
  return points.map(([x, y]) => (
    <circle key={x} cx={x} cy={y} r=".1" stroke={theme.text.secondary} />
  ));
};

export default function ({ data }: LineChartProps) {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  const loadDimensions = useCallback((node) => {
    console.log('hi');
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);

  const [points, yAverage] = useMemo(() => {
    if (!data || !rect) return ['', 0];
    const height = rect.height;
    const width = rect.width;

    const prices = getSortedPrices(data);

    const maxY = Math.max(...prices);
    const minY = Math.min(...prices);
    const maxX = prices.length;

    const average =
      prices.reduce((prev, curr) => (curr += prev)) / prices.length;
    const yAverage = height - ((average - minY) / (maxY - minY)) * height;

    return [
      prices
        .map((rawY, rawX) => {
          const x = (rawX / maxX) * width;
          const y = height - ((rawY - minY) / (maxY - minY)) * height;
          return `${x},${y}`;
        })
        .join(' '),
      yAverage,
    ];
  }, [data, rect]);

  const theme = useContext(ThemeContext);

  return (
    <Wrapper ref={loadDimensions}>
      <StyledSVG
        viewBox={rect ? `0 0 ${rect.width} ${rect.height}` : '0 0 0 0'}
      >
        <polyline
          fill="none"
          stroke={theme.text.red}
          strokeWidth={3}
          points={points}
        />
        {createLine(yAverage, theme, rect)}
      </StyledSVG>
    </Wrapper>
  );
}
