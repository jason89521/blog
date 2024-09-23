import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/context/Theme';
import { getInitTheme } from '@/lib/utils';
import ThemeToggleButton from './ThemeToggleButton';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const themeScript = `
  const theme = (${getInitTheme.toString()})();
  document.documentElement.dataset.theme = theme;
`;

export const metadata: Metadata = {
  title: "Yu Xuan's Blog",
  description: "Yu Xuan's Blog page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='zh-Hant' suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ThemeToggleButton />
          <div className='min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300'>
            <div className='max-w-lg sm:max-w-xl md:max-w-2xl mx-auto'>{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
