import Header from '@/app/Header';
import TagGroup from '@/components/TagGroup';
import { Badge } from '@/components/ui/badge';
import { listPost, listPostByTag } from '@/lib/post';
import Link from 'next/link';

interface Params {
  name: string;
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const posts = await listPost();
  const tags = posts.reduce((acc, post) => {
    post.tags.forEach(tag => {
      acc.add(tag);
    });
    return acc;
  }, new Set<string>());

  return [...tags].map(tag => ({
    tag,
  }));
}

export default async function TagPage({ params }: { params: Params }) {
  const tag = params.name.replace(/%20/g, ' ');
  const filteredPosts = await listPostByTag(tag);

  return (
    <div>
      <Header title={tag}>
        <Badge variant='secondary' className='text-sm'>
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
        </Badge>
      </Header>
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
                <article className='prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 mb-2'>
                  {post.content}
                </article>
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
