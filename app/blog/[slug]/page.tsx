import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPost } from '@/lib/post';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    redirect('/');
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPost({ params }: { params: Params }) {
  const _post = await getPost(params.slug);
  if (!_post) {
    redirect('/');
  }

  const { previousPost, nextPost, ...post } = _post;

  return (
    <div className='py-4 sm:py-8 px-4'>
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
        <h1 className='text-2xl sm:text-4xl font-bold mb-2'>{post.title}</h1>
        <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>{post.date}</p>
      </header>
      <main>
        <article className='prose dark:prose-invert max-w-none text-sm sm:text-base'>
          {post.excerpt}
          {post.content}
        </article>
      </main>
      <footer className='mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          {previousPost ? (
            <Link
              href={`/blog/${previousPost.slug}`}
              className='text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center text-sm sm:text-base'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              <span className='line-clamp-1'>{previousPost.title}</span>
            </Link>
          ) : (
            <span className='text-gray-600 dark:text-gray-400 text-sm sm:text-base'>
              沒有更新的文章了
            </span>
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className='text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center text-sm sm:text-base self-end sm:self-auto'
            >
              <span className='line-clamp-1'>{nextPost.title}</span>
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          ) : (
            <span className='text-gray-600 dark:text-gray-400 text-sm sm:text-base'>
              沒有更舊的文章了
            </span>
          )}
        </div>
        <div className='mt-4 sm:mt-6 text-center'>
          <Link
            href='/'
            className='text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base'
          >
            返回文章列表
          </Link>
        </div>
      </footer>
    </div>
  );
}
