import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { ReactNode } from 'react';
import { z } from 'zod';
import { isNonNullable, pick, safeAwait } from './utils';
import { MDXContent } from 'mdx/types';

interface Post {
  title: string;
  content: ReactNode;
  excerpt: ReactNode;
  description: string;
  date: string;
  slug: string;
  tags: string[];
}

const MetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional().default([]),
});

const DATE_PATTERN = /\d{4}-\d{1,2}-\d{1,2}/g;

async function listPostFilenames() {
  const filenames = await readdir(path.resolve('posts'));
  filenames.sort((a, b) => b.localeCompare(a));
  return filenames;
}

type ListPostResult = Omit<Post, 'content'>;

export async function listPost(): Promise<ListPostResult[]> {
  const filenames = await listPostFilenames();
  return await Promise.all(
    filenames.map(async filename => {
      const data = await getPostData(filename);
      delete data.content;
      return data;
    })
  );
}

export async function listPostByTag(tag: string) {
  const filenames = await listPostFilenames();
  const posts = (
    await Promise.all(
      filenames.map(async filename => {
        const data = await getPostData(filename);
        const hit = data.tags.includes(tag);
        return hit ? data : null;
      })
    )
  ).filter(isNonNullable);

  return posts;
}

interface GetPostResult extends Post {
  previousPost: Pick<Post, 'title' | 'slug'> | null;
  nextPost: Pick<Post, 'title' | 'slug'> | null;
}

export async function getPost(slug: string): Promise<GetPostResult | null> {
  const filename = `${slug}.md`;
  const filenames = await listPostFilenames();
  const index = filenames.indexOf(filename);
  if (index === -1) {
    return null;
  }
  const [, data] = await safeAwait(getPostData(filename));
  if (!data) {
    return data;
  }
  const [, previousPost] = await safeAwait(getPostData(filenames[index - 1]));
  const [, nextPost] = await safeAwait(getPostData(filenames[index + 1]));

  return {
    ...data,
    previousPost: pick(previousPost, ['title', 'slug']),
    nextPost: pick(nextPost, ['slug', 'title']),
  };
}

async function getPostData(filename: string): Promise<Post> {
  const m = await import(`@/posts/${filename}`);
  const metadata = MetadataSchema.parse(m.metadata);
  const content = m.default() as ReturnType<MDXContent>;
  const excerpt = (() => {
    const children = content.props.children as JSX.Element[];
    const h2Index = children.findIndex(el => {
      return typeof el.type === 'string' && el.type === 'h2';
    });

    if (h2Index === -1) {
      return [];
    }

    return children.slice(0, h2Index);
  })();

  const { name } = path.parse(filename);
  const dateMatch = filename.match(DATE_PATTERN);
  if (!dateMatch) {
    throw new Error('Cannot match date in post file.');
  }
  const date = dateMatch[0];

  return {
    ...metadata,
    excerpt,
    slug: name,
    date,
    content,
  };
}
