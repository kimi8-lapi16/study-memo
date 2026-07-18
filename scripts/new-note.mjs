#!/usr/bin/env node
/**
 * 新しい勉強会メモ（MDX）の雛形を作る。
 *
 *   npm run new -- <slug> "記事タイトル"
 *
 * 例:
 *   npm run new -- terraform-best-practices "Terraform ベストプラクティス 勉強会メモ"
 *
 * src/content/notes/<slug>.mdx を生成する（既存ならエラー）。
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const [, , slug, ...titleParts] = process.argv;

if (!slug) {
  console.error('使い方: npm run new -- <slug> "記事タイトル"');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('slug は英小文字・数字・ハイフンのみ（例: terraform-best-practices）');
  process.exit(1);
}

const title = titleParts.join(' ') || 'タイトル未設定 勉強会メモ';
const today = new Date().toISOString().slice(0, 10);
const dir = join(root, 'src', 'content', 'notes');
const file = join(dir, `${slug}.mdx`);

try {
  await access(file);
  console.error(`既に存在します: ${file}`);
  process.exit(1);
} catch {
  // 存在しない = OK
}

const template = `---
title: ${title}
listTitle: ${title} — サブタイトルをここに。
date: ${today}
category: CATEGORY
tags: [TAG1, TAG2]
summary: 一覧・RSS に出る2〜3行の要約をここに書く。
kicker: Sub Topic
heroTitle: '${title}<br><span class="em">キーワード</span>を<span class="v">強調</span>。'
sub: 'ヒーローのサブ文。<br>2行くらいで概要を。'
metaTags:
  - TAG ONE
  - TAG TWO
footerNote: 'topic · keywords'
disclaimer: '※ 注意書きがあればここに（任意）。'
---

## 最初の章

ここに書いた最初の段落は、章のリード文として表示される。

本文は素のマークダウンでOK。**強調** / \`inline code\` / 箇条書き / 表が使える。

- 箇条書きはデザイン済みリストで表示される
- **太字** は黒、青にしたいときは <strong class="acc">これ</strong>

### 小見出し

<Card label="ラベル">
カードのコールアウト。variant="v"（赤）/ "amber"（橙）も指定できる。
</Card>

<Note label="⚠ 注意">
注意喚起のコールアウト。
</Note>

<Tip label="▶ メモ">
補足・実務メモのコールアウト。
</Tip>

<Flow>
  <FNode>ステップA</FNode>
  <Arr />
  <FNode hl>ステップB（強調）</FNode>
</Flow>

## 次の章

\`##\` を足すと章が増え、目次（TOC）と \`02\` の採番は自動。
`;

await mkdir(dir, { recursive: true });
await writeFile(file, template, 'utf8');
console.log(`✓ 作成しました: src/content/notes/${slug}.mdx`);
console.log('  npm run dev でプレビューできます。');
