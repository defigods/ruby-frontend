import React, { useMemo } from 'react';
import {
  createGlobalStyle,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      green: string;
      red: string;
      secondaryRed: string;
    };
  }
}

export function createTheme(darkMode: boolean): DefaultTheme {
  return {
    colors: {
      primary: darkMode ? '#222329' : '#FFFFFF',
      secondary: darkMode ? '#080D17' : '#f5f8fa',
      tertiary: '#BA2F2A',
    },
    text: {
      primary: darkMode ? '#ECE9E4' : '#222228',
      secondary: darkMode ? '#82929F' : '#A3A5AB',
      tertiary: '#BA2F2A',

      green: '#21CE99',
      red: '#BA2F2A',
      secondaryRed: '#461210',
    },
  };
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = false; // TODO

  const themeObject = useMemo(() => createTheme(darkMode), [darkMode]);

  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {children}
    </StyledComponentsThemeProvider>
  );
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
    font-family: 'Montserrat', sans-serif;
    // letter-spacing: -0.018em;
    font-display: fallback;
}
html,
body {
    margin: 0;
    padding: 0;
}
* {
    box-sizing: border-box;
}
button {
    user-select: none;
}
html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
`;

export const ThemedGlobalStyle = createGlobalStyle`
html {
    color: ${({ theme }) => theme.text.primary};
    background-color: ${({ theme }) => theme.colors.primary};
}
`;
