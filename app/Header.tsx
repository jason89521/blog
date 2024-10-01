import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  children: ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header className='mb-8 sm:mb-12 relative'>
      <div className='flex justify-between items-center mb-4'>
        <Link
          href='/'
          className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          返回文章列表
        </Link>
      </div>
      <h1 className='text-2xl sm:text-4xl font-bold mb-2'>{title}</h1>
      {children}
    </header>
  );
}
