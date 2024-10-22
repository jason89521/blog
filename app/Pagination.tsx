import TagGroup from '@/components/TagGroup';
import { Post } from '@/lib/post';
import Link from 'next/link';
import { ReactNode } from 'react';

interface Props {
  index: number;
  maxIndex: number;
  posts: Post[];
  linkPrefix: string;
  title?: ReactNode;
}

export default function Pagination({ posts, index, maxIndex, linkPrefix, title }: Props) {
  return (
    <div>
      {title}
      <ul className='space-y-8'>
        {posts.map(post => (
          <li key={post.slug} className='border-b border-gray-200 dark:border-gray-700 pb-6'>
            <Link href={`/blog/${post.slug}`} className='block group'>
              <h3 className='text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                {post.title}
              </h3>
            </Link>
            <article className='prose dark:prose-invert max-w-none'>{post.content}</article>
            <TagGroup tags={post.tags} />
            <span className='block mt-2 text-sm text-gray-500 dark:text-gray-500'>
              {post.date ?? '2024-04-04'}
            </span>
          </li>
        ))}
      </ul>
      <div className='flex mt-4'>
        {index > 0 && (
          <Link href={`${linkPrefix}/${index - 1}`} className='block'>
            上一頁
          </Link>
        )}
        {index + 1 < maxIndex && (
          <Link href={`${linkPrefix}/${index + 1}`} className='block ml-auto'>
            下一頁
          </Link>
        )}
      </div>
    </div>
  );
}
