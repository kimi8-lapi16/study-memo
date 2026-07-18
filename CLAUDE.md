# study-memo

勉強会メモのアーカイブサイト。**Astro + MDX** で、`src/content/notes/*.mdx` を単一ソースに
記事ページ・トップの一覧・RSS を自動生成する。GitHub Pages（`/study-memo/`）で公開。

## コマンド

```
npm install        # 初回
npm run dev        # プレビュー http://localhost:4321/study-memo/
npm run build      # dist/ に出力（CIと同じ）
npm run new -- <slug> "タイトル"   # 記事の雛形を作成
```

## 記事を追加する

1. `npm run new -- <slug> "タイトル"` → `src/content/notes/<slug>.mdx`
2. front-matter と本文（マークダウン）を書く
3. 章は `## 見出し`（目次と `01` 採番は自動 / 先頭段落がリード文）
4. コールアウトは `<Card>` `<Note>` `<Tip>` `<Flow>`、技術語は `<Mono>`
5. 凝った図は `common.css` のクラスで生HTMLを直接書ける

詳細は `.claude/skills/md-to-html.md` を参照。

## 構成

- `src/content/notes/*.mdx` … 記事（単一ソース）。スキーマは `src/content.config.ts`
- `src/layouts/BaseLayout.astro` … 共通の `<head>` とrevealスクリプト
- `src/pages/index.astro` … トップの一覧（勉強メモ／ニュースのタブ切替。全記事から自動生成）
- `src/pages/notes/[id].astro` … 記事ページ（ヒーロー＋TOC＋本文＋フッター）
- `src/pages/rss.xml.js` … RSS
- `src/components/*.astro` … MDXで使う部品（Card / Note / Tip / Flow / FNode / Arr / Mono）
- `src/plugins/rehype-sections.mjs` … `##` を `<section>` 化し `// NN` を採番
- `src/styles/common.css` … デザインシステム（白黒基調＋最小限のアクセント色）
- `original-memo/` … 生メモの下書き（ビルド対象外）

## デプロイ

`master` への push で `.github/workflows/deploy.yml` が `npm ci && npm run build` し、
`dist/` を GitHub Pages へ。base path は `astro.config.mjs` の `base: '/study-memo'`。

## 自動生成記事について

`src/content/notes/news-YYYY-MM-DD.mdx`（`category: NEWS`）は、毎朝7:00(JST)に
GitHub Actions（`.github/workflows/daily-news-digest.yml`）が自動収集・生成し、
masterへのPRを自動作成しているITニュースダイジェスト（マージはリポジトリオーナーが
手動で行う）。生成ルールは `docs/daily-news-digest.md` を参照。
