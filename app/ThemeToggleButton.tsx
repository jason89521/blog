'use client';

import { useTheme } from '@/components/context/Theme';
import { Button } from '@/components/ui/button';
import { Theme } from '@/lib/types';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleButton() {
  const [theme, setTheme] = useTheme();
  const isDarkMode = theme === 'dark';

  const toggleDarkMode = () => {
    if (isDarkMode) {
      setTheme('light');
      setDocumentTheme('light');
    } else {
      setTheme('dark');
      setDocumentTheme('dark');
    }
  };
  return (
    <Button
      variant='outline'
      size='icon'
      className='fixed z-10 right-2 top-2 sm:right-4 sm:top-4 md:right-6 md:top-6 text-gray-900 dark:text-gray-100'
      onClick={toggleDarkMode}
    >
      <Sun data-hide-on-theme='light' className='h-[1.2rem] w-[1.2rem]' />
      <Moon data-hide-on-theme='dark' className='h-[1.2rem] w-[1.2rem]' />
      <span className='sr-only'>Toggle dark mode</span>
    </Button>
  );
}

function setDocumentTheme(theme: Theme) {
  localStorage.setItem('theme', theme);
  const el = document.documentElement;
  el.dataset.theme = theme;
}
