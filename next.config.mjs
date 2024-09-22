import createMDX from '@next/mdx';
import { remarkCodeHike, recmaCodeHike } from 'codehike/mdx';
import remarkGfm from 'remark-gfm';

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
    remarkPlugins: [[remarkCodeHike, chConfig], remarkGfm],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true,
  },
});

export default withMDX(nextConfig);
