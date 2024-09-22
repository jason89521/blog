import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Theme } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitTheme(): Theme {
  const theme = localStorage.getItem('theme');
  if (!theme) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  return theme === 'dark' ? 'dark' : 'light';
}

export function getInitThemeInServer(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return getInitTheme();
}

export async function safeAwait<T, E = unknown>(
  promiseOrCb: Promise<T> | (() => Promise<T>)
): Promise<[E | null, T | null]> {
  try {
    const p = typeof promiseOrCb === 'function' ? promiseOrCb() : promiseOrCb;
    const data = await p;
    return [null, data];
  } catch (error) {
    return [error as E, null];
  }
}

export function pick<T, K extends keyof T>(o?: T, properties?: K[]): Pick<T, K>;
export function pick<T, K extends keyof T>(o?: T | null, properties?: K[]): Pick<T, K> | null;
export function pick<T, K extends keyof T>(o?: T | null, properties: K[] = []): Pick<T, K> | null {
  if (!o) {
    return null;
  }
  const ret = {} as any;
  properties.forEach(p => {
    ret[p] = o[p];
  });
  return o;
}
