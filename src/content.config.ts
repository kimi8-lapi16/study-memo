import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    // 一覧・メタ情報
    title: z.string(), // 一覧やメタタグで使うプレーンなタイトル
    date: z.coerce.date(), // 公開日（YYYY-MM-DD）
    category: z.string(), // 一覧のカテゴリ表示（例: DATABASE）
    tags: z.array(z.string()).default([]), // 一覧のタグ
    summary: z.string(), // 一覧・RSS の要約
    listTitle: z.string().optional(), // 一覧カードの見出し（未指定なら title）
    draft: z.boolean().default(false), // true の記事はビルド対象外

    // ヒーロー（記事ページ上部）。未指定なら title 等から補完。
    kicker: z.string().optional(), // kicker の "Study Notes ·" に続く後半テキスト
    heroTitle: z.string().optional(), // <br>/<span class="em"> 等の装飾HTMLを許可
    sub: z.string().optional(), // ヒーローのサブ文（HTML可）
    metaTags: z.array(z.string()).default([]), // ヒーローのタグ群

    // フッター
    footerNote: z.string().optional(), // 「// database design ...」的な一行
    disclaimer: z.string().optional(), // 注意書き（HTML可）
  }),
});

export const collections = { notes };
