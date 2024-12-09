import Pagination from '@/app/Pagination';
import { getMaxPageIndex, listPostByIndex } from '@/lib/post';
import { redirect } from 'next/navigation';

interface Params {
  index: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const pagesNum = await getMaxPageIndex();

  return new Array(pagesNum).fill(0).map((_, index) => {
    return {
      index: `${index}`,
    };
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  const params = await props.params;
  const index = parseInt(params.index);
  const maxIndex = await getMaxPageIndex();

  if (Number.isNaN(index) || index >= maxIndex || index <= 0) {
    redirect('/');
  }
  const posts = await listPostByIndex(index);
  if (posts.length <= 0) {
    redirect('/');
  }

  return (
    <div>
      <header className='mb-12 text-center relative'>
        <h1 className='text-4xl font-bold mb-2'>Yu Xuan&apos;s Blog</h1>
        <p className='text-xl text-gray-600 dark:text-gray-400'>記錄一些學到的東西，以及生活雜記</p>
      </header>
      <Pagination posts={posts} index={index} maxIndex={maxIndex} linkPrefix='/page' />
    </div>
  );
}
