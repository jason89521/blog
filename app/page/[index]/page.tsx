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

export default async function Page({ params }: { params: Params }) {
  const index = parseInt(params.index);
  if (Number.isNaN(index)) {
    redirect('/');
  }
  if (index <= 0) {
    redirect('/');
  }
  const posts = await listPostByIndex(index);
  if (posts.length <= 0) {
    redirect('/');
  }
  const maxIndex = await getMaxPageIndex();

  return (
    <div className='pt-12'>
      <Pagination posts={posts} index={index} maxIndex={maxIndex} linkPrefix='/page' />
    </div>
  );
}
