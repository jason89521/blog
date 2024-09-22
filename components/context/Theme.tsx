'use client';
import { getInitThemeInServer } from '@/lib/utils';
import { Theme } from '@/lib/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

const ThemeContext = createContext<[theme: Theme, setTheme: Dispatch<SetStateAction<Theme>>]>([
  getInitThemeInServer(),
  () => {},
]);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const contextValue = useState(getInitThemeInServer);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
