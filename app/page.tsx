import { getMaxPageIndex, listPostByIndex } from '@/lib/post';
import Pagination from './Pagination';

export default async function BlogIndex() {
  const maxIndex = await getMaxPageIndex();
  const index = 0;
  const posts = await listPostByIndex(index);

  return (
    <div>
      <header className='mb-12 text-center relative'>
        <h1 className='text-4xl font-bold mb-2'>Yu Xuan&apos;s Blog</h1>
        <p className='text-xl text-gray-600 dark:text-gray-400'>記錄一些學到的東西，以及生活雜記</p>
      </header>
      <main>
        <Pagination
          posts={posts}
          index={index}
          linkPrefix='/page'
          title={<h2 className='text-2xl font-semibold mb-6'>文章列表</h2>}
          maxIndex={maxIndex}
        />
      </main>
    </div>
  );
}
