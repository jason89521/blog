import { Block, parseRoot } from 'codehike/blocks';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { ReactNode } from 'react';
import { z } from 'zod';
import { pick, safeAwait } from './utils';

interface Post {
  title: string;
  content: ReactNode;
  excerpt: ReactNode;
  description: string;
  date: string;
  slug: string;
}

const Schema = Block.extend({
  excerpt: Block,
  title: z.string(),
  description: z.string(),
  content: Block,
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
  const m: typeof import('*.md') = await import(`@/posts/${filename}`);
  const { name } = path.parse(filename);
  const dateMatch = filename.match(DATE_PATTERN);
  if (!dateMatch) {
    throw new Error('Cannot match date in post file.');
  }
  const date = dateMatch[0];
  const { title, description, excerpt, content } = parseRoot(m.default, Schema);

  return {
    title,
    description,
    excerpt: excerpt.children,
    slug: name,
    date,
    content: content.children,
  };
}
