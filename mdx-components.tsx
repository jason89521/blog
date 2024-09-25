import type { MDXComponents } from 'mdx/types';
import Code from './components/Code';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Code,
  };
}
