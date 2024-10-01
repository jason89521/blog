import TagGroup from '@/components/TagGroup';
import { Badge } from '@/components/ui/badge';
import { listPostByTag } from '@/lib/post';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Params {
  name: string;
}

export default async function TagPage({ params }: { params: Params }) {
  const tag = params.name.replace(/%20/g, ' ');
  const filteredPosts = await listPostByTag(tag);

  return (
    <div className='py-4 sm:py-8 px-4 min-h-screen'>
      <header className='mb-12 relative'>
        <div className='flex justify-between items-center mb-4'>
          <Link
            href='/'
            className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to all posts
          </Link>
        </div>
        <h1 className='text-3xl sm:text-4xl font-bold mb-2'>Posts tagged with &quot;{tag}&quot;</h1>
        <Badge variant='secondary' className='text-sm'>
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
        </Badge>
      </header>
      <main>
        {filteredPosts.length > 0 ? (
          <ul className='space-y-8'>
            {filteredPosts.map(post => (
              <li key={post.slug} className='border-b border-gray-200 dark:border-gray-700 pb-6'>
                <Link href={`/blog/${post.slug}`} className='block group'>
                  <h2 className='text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {post.title}
                  </h2>
                </Link>
                <div className='text-gray-600 dark:text-gray-400 mb-2'>{post.excerpt}</div>
                <TagGroup activeTag={tag} tags={post.tags} />
                <span className='text-sm text-gray-500 dark:text-gray-500'>{post.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-center text-gray-600 dark:text-gray-400'>
            No posts found with this tag.
          </p>
        )}
      </main>
    </div>
  );
}
