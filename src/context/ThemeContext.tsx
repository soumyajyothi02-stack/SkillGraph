import React, { createContext, useContext } from 'react';

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    bgBase: string;
    bgSurface: string;
    bgElevated: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentCopper: string;
    accentSand: string;
    statusSage: string;
    statusTerracotta: string;
  };
  graph: {
    background: string;
    linkStroke: string;
    linkHighlight: string;
    linkLabel: string;
    nodeText: string;
    nodeStrokeContrast: string;
    gridColor: string;
    nodeColors: {
      Skill: { fill: string; stroke: string; text: string; bg: string };
      Technology: { fill: string; stroke: string; text: string; bg: string };
      JobRole: { fill: string; stroke: string; text: string; bg: string };
      Company: { fill: string; stroke: string; text: string; bg: string };
    };
  };
}

export const EDITORIAL_THEME: ThemeConfig = {
  id: 'editorial',
  name: 'Editorial Developer',
  isDark: true,
  colors: {
    bgBase: '#11110F',
    bgSurface: '#191917',
    bgElevated: '#22221F',
    border: '#2E2E2A',
    textPrimary: '#F2EFE7',
    textSecondary: '#A7A39A',
    textMuted: '#6E6A62',
    accentCopper: '#C87941',
    accentSand: '#D8C7A5',
    statusSage: '#7A9A7B',
    statusTerracotta: '#C0614E',
  },
  graph: {
    background: '#11110F',
    linkStroke: '#2E2E2A',
    linkHighlight: '#C87941',
    linkLabel: '#A7A39A',
    nodeText: '#F2EFE7',
    nodeStrokeContrast: '#11110F',
    gridColor: 'rgba(242, 239, 231, 0.04)',
    nodeColors: {
      Skill: { fill: '#C87941', stroke: '#E08C50', text: '#E08C50', bg: 'rgba(200, 121, 65, 0.16)' },
      Technology: { fill: '#D8C7A5', stroke: '#E8DCC2', text: '#E8DCC2', bg: 'rgba(216, 199, 165, 0.16)' },
      JobRole: { fill: '#7A9A7B', stroke: '#92B293', text: '#92B293', bg: 'rgba(122, 154, 123, 0.16)' },
      Company: { fill: '#C0614E', stroke: '#D47562', text: '#D47562', bg: 'rgba(192, 97, 78, 0.16)' },
    },
  },
};

interface ThemeContextType {
  themeConfig: ThemeConfig;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeConfig: EDITORIAL_THEME,
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider
      value={{
        themeConfig: EDITORIAL_THEME,
        isDark: true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
