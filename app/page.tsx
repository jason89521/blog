import { listPost } from '@/lib/post';
import Link from 'next/link';

export default async function BlogIndex() {
  const posts = await listPost();

  return (
    <div className='py-8 px-4'>
      <header className='mb-12 text-center relative'>
        <h1 className='text-4xl font-bold mb-2'>Yu Xuan&apos;s Blog</h1>
        <p className='text-xl text-gray-600 dark:text-gray-400'>記錄一些學到的東西，以及生活雜記</p>
      </header>
      <main>
        <h2 className='text-2xl font-semibold mb-6'>文章列表</h2>
        <ul className='space-y-8'>
          {posts.map(post => (
            <li key={post.slug} className='border-b border-gray-200 dark:border-gray-700 pb-6'>
              <Link href={`/blog/${post.slug}`} className='block group'>
                <h3 className='text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                  {post.title}
                </h3>
              </Link>
              <article className='prose dark:prose-invert max-w-none'>{post.excerpt}</article>
              <span className='block mt-2 text-sm text-gray-500 dark:text-gray-500'>
                {post.date ?? '2024-04-04'}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
