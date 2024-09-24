import createMDX from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { remarkCodeHike, recmaCodeHike } from 'codehike/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  components: { code: 'Code' },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      [remarkCodeHike, chConfig],
      remarkGfm,
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'metadata' }],
    ],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true,
  },
});

export default withMDX(nextConfig);
