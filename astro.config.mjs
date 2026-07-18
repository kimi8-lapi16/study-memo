import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSections from './src/plugins/rehype-sections.mjs';

// GitHub Pages (project page) で配信するため base を設定
// 公開URL: https://kimi8-lapi16.github.io/study-memo/
export default defineConfig({
  site: 'https://kimi8-lapi16.github.io',
  base: '/study-memo',
  trailingSlash: 'always',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeSections],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
