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

生メモ（`original-memo/*.md`）からの変換は `/memo-to-mdx` スキル（`.claude/skills/memo-to-mdx/SKILL.md`）を使う。
既に一部が MDX 化済みの場合は全体を再生成せず、**未変換の章だけを差分で追記**する（詳細はスキル参照）。

## UI変更

一覧のグルーピングやフィルタなど、UI/インタラクションを追加・変更するときは、
実装前に想定するインタラクション（例: ドロップダウン／タブ／見出し固定）を一言で
確認してから着手する。「〜ごとに分ける」「〜で絞り込む」等の指示だけでは、
静的な見出し表示か切り替え式フィルタかが決まらないため。
また `:has()` など DOM の入れ子構造に依存する CSS セレクタは避け、
`class`/`data-*` 属性を明示的に付けて対象を指定する（ラッパー要素の追加で壊れやすいため）。

## Git

過去の変更は基本的にPR経由でmasterにマージされている（日次ニュースダイジェストの自動pushを除く）。
作業ブランチを切ってPRを作成する運用を基本とし、`git push` や `npm run build` が失敗した場合は
ユーザーに確認する前に、まずエラー出力全文（`git push -v` の標準エラー等）を自分で読んで原因を特定する。

## フォーマット

`original-memo/*.md` は Prettier 管理下（`.prettierrc.json`）。編集したら
`npm run format`（`npm run format:check` で確認のみ）を実行する。
`.githooks/pre-commit`（`npm install` 時の `prepare` スクリプトで有効化）が
コミット対象の `original-memo/*.md` をコミット時に自動整形するため、
基本的には手動実行は不要。編集のたびには整形しない。

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

`src/content/notes/news/YYYYMM/news-YYYY-MM-DD.mdx`（`category: NEWS`）は、毎朝7:00(JST)に
GitHub Actions（`.github/workflows/daily-news-digest.yml`）が自動収集・生成し、
masterへ直接pushしているITニュースダイジェスト（PR・人手レビューは挟まない）。
生成ルールは `docs/daily-news-digest.md` を参照。
