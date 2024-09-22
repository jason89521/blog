import { highlight, Pre, RawCode } from 'codehike/code';
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Code,
  };
}

async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, 'github-dark');
  return <Pre code={highlighted} />;
}
