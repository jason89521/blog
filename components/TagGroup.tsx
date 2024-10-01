import Link from 'next/link';
import { Badge } from './ui/badge';

interface TagGroupProps {
  tags: string[];
  activeTag?: string;
}

export default function TagGroup({ tags, activeTag }: TagGroupProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className='flex gap-2 my-2 flex-wrap'>
      {tags.map(tag => {
        const isActiveTag = tag === activeTag;

        return (
          <Link href={`/tag/${tag}`} key={tag}>
            <Badge variant={isActiveTag ? 'default' : 'secondary'}>{tag}</Badge>
          </Link>
        );
      })}
    </div>
  );
}
