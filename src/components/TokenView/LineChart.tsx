import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { DefaultTheme, ThemeContext } from 'styled-components';
import moment from 'moment';

interface LineChartProps {
  data?: { [timestamp: number]: number };
  onHover: (timestamp?: number) => void;
}

const Wrapper = styled.div`
  width: calc(100% - 40px);
  height: 300px;
  margin: 0 20px;
  margin-top: 40px;
  margin-bottom: 3px;
`;

const StyledSVG = styled.svg`
  overflow: visible;
`;

const createLine = (yValue: number, theme: DefaultTheme, rect?: DOMRect) => {
  const NUM_POINTS = 50;
  if (!rect) return null;

  const points = [...new Array(NUM_POINTS)].map((_, idx) => [
    (idx / (NUM_POINTS - 1)) * (rect.width || 0),
    yValue,
  ]);
  return points.map(([x, y]) => (
    <circle key={x} cx={x} cy={y} r=".1" stroke={theme.text.secondary} />
  ));
};

const StyledTextLabel = styled.text`
  font-size: 10px;
  color: ${({ theme }) => theme.text.secondary};
  color: red;
  text-transform: uppercase;
  margin-bottom: 5px;
  padding-bottom: 5px;
`;

export default function ({ data, onHover }: LineChartProps) {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);
  const [[mouseX, mouseY], setMouseCoordinates] = useState([0, 0]);
  const [hovering, setHovering] = useState(true);

  const loadDimensions = useCallback((node) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);

  const [points, yAverage] = useMemo(() => {
    if (!data || !rect) return [[], 0];
    const height = rect.height;
    const width = rect.width;
    const prices = Object.values(data);

    const maxY = Math.max(...prices);
    const minY = Math.min(...prices);
    const maxX = prices.length;

    const average =
      prices.reduce((prev, curr) => (curr += prev)) / prices.length;
    const yAverage = height - ((average - minY) / (maxY - minY)) * height;

    return [
      Object.keys(data)
        .map((n) => Number(n))
        .map((timestamp, rawX) => {
          const rawY = data[timestamp];
          const x = (rawX / maxX) * width;
          const y = height - ((rawY - minY) / (maxY - minY)) * height;
          return [timestamp, x, y];
        }),
      yAverage,
    ];
  }, [data, rect]);

  const theme = useContext(ThemeContext);

  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | undefined>(
    undefined,
  );

  const hoverTooltip = useMemo(() => {
    if (!rect || points.length === 0 || !hovering) return null;
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    if (x < 0 || y < 0 || x > points[points.length - 1][1]) return null;

    const minValues = points.map((p) => Math.abs(x - p[1]));
    const minIndex = minValues.indexOf(Math.min(...minValues));

    setHoveredTimestamp(points[minIndex][0]);
    const xGraph = points[minIndex][1];

    const linePoints = `${xGraph},0 ${xGraph},${rect.height}`;
    const Line = (
      <polyline
        fill="none"
        stroke={theme.text.secondary}
        strokeWidth={1}
        points={linePoints}
        key="line"
        style={{ opacity: 0.5 }}
      />
    );

    const InnerCircle = (
      <circle
        key="inner"
        cx={xGraph}
        cy={points[minIndex][2]}
        r="1"
        stroke="black"
      />
    );

    const OuterCircle = (
      <circle
        key="outer"
        cx={xGraph}
        cy={points[minIndex][2]}
        r="2"
        stroke={theme.text.secondary}
      />
    );

    const TextLabel = (
      <StyledTextLabel
        x={xGraph}
        cy={-30}
        key="label"
        fill={theme.text.secondary}
      >
        {moment(points[minIndex][0]).format('h:mm A MMM D [CDT]')}
      </StyledTextLabel>
    );

    return [Line, InnerCircle, OuterCircle, TextLabel];
  }, [mouseX, mouseY, points, hovering]);

  useEffect(() => {
    onHover(hovering ? hoveredTimestamp : undefined);
  }, [hoveredTimestamp, hovering]);

  return (
    <Wrapper ref={loadDimensions}>
      <StyledSVG
        viewBox={rect ? `0 0 ${rect.width} ${rect.height}` : '0 0 0 0'}
        preserveAspectRatio="none"
        onMouseMove={(e) => setMouseCoordinates([e.pageX, e.pageY])}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <polyline
          fill="none"
          stroke={theme.text.red}
          strokeWidth={2}
          points={points.map(([_, x, y]) => `${x},${y}`).join(' ')}
        />
        {createLine(yAverage, theme, rect)}
        {hoverTooltip}
      </StyledSVG>
    </Wrapper>
  );
}
