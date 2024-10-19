import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { ReactNode } from 'react';
import { z } from 'zod';
import { isNonNullable, pick, safeAwait } from './utils';
import { compileMDX, MDXRemoteProps } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeShiki, { RehypeShikiOptions } from '@shikijs/rehype';

interface Post {
  title: string;
  content: ReactNode;
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

const serializeOptions = {
  parseFrontmatter: true,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypeShiki,
        {
          theme: 'vitesse-dark',
          transformers: [
            {
              pre(hast) {
                const raw = this.options.meta?.__raw;
                if (!raw) {
                  return;
                }
                hast.properties['data-filename'] = raw;
              },
            },
          ],
        } satisfies RehypeShikiOptions,
      ],
    ],
  },
} satisfies MDXRemoteProps['options'];

const DATE_PATTERN = /\d{4}-\d{1,2}-\d{1,2}/g;

async function listPostFilenames() {
  const filenames = await readdir(path.resolve('posts'));
  filenames.sort((a, b) => b.localeCompare(a));
  return filenames;
}

export async function listPost(): Promise<Post[]> {
  const filenames = await listPostFilenames();
  return await Promise.all(
    filenames.map(async filename => {
      const data = await getShortPost(filename);
      return data;
    })
  );
}

export async function listPostByTag(tag: string): Promise<Post[]> {
  const filenames = await listPostFilenames();
  const posts = await Promise.all(
    filenames.map(async filename => {
      const data = await getShortPost(filename);
      const hit = data.tags.includes(tag);
      return hit ? data : null;
    })
  );

  return posts.filter(isNonNullable);
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
  const [, data] = await safeAwait(getLongPost(filename));
  if (!data) {
    return data;
  }
  const [, previousPost] = await safeAwait(getShortPost(filenames[index - 1]));
  const [, nextPost] = await safeAwait(getShortPost(filenames[index + 1]));

  return {
    ...data,
    previousPost: pick(previousPost, ['title', 'slug']),
    nextPost: pick(nextPost, ['slug', 'title']),
  };
}

async function getShortPost(filename: string): Promise<Post> {
  const fileContent = await readPostFile(filename);
  const h2Index = fileContent.search(/^## .*\n/m);
  if (h2Index === -1) {
    throw new Error('Cannot find h2');
  }
  const summarySource = fileContent.slice(0, h2Index);
  return getPostData(filename, summarySource);
}

async function getLongPost(filename: string): Promise<Post> {
  const fileContent = await readPostFile(filename);
  return getPostData(filename, fileContent);
}

async function getPostData(filename: string, source: string): Promise<Post> {
  const { content, frontmatter } = await compileMDX({
    source,
    options: serializeOptions,
  });
  const metadata = MetadataSchema.parse(frontmatter);
  const slug = path.parse(filename).name;
  const dateMatch = slug.match(DATE_PATTERN);
  if (!dateMatch) {
    throw new Error('Cannot match date in post file.');
  }
  const date = dateMatch[0];

  return {
    ...metadata,
    content,
    slug,
    date,
  };
}

async function readPostFile(filename: string): Promise<string> {
  const fileBuffer = await readFile(path.resolve(`posts/${filename}`));
  const fileContent = fileBuffer.toString();

  return fileContent;
}
