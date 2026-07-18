# new-note（旧 md-to-html）

勉強会メモを **MDX で1ファイル書くだけ** で、共通デザインのHTMLページ・トップの一覧・RSS が
自動生成されるようになった。もう手書きHTMLは不要。

## ワークフロー

1. 雛形を作る:

   ```
   npm run new -- <slug> "記事タイトル"
   # 例: npm run new -- terraform-tips "Terraform Tips 勉強会メモ"
   ```

   → `src/content/notes/<slug>.mdx` ができる。

2. front-matter と本文を埋める（下記参照）。

3. プレビュー:

   ```
   npm run dev      # http://localhost:4321/study-memo/
   ```

4. ビルド確認（CIと同じ）:

   ```
   npm run build
   ```

`original-memo/` の生メモから書き起こす場合は、メモを読んで MDX に整形する。
章は `## 見出し`、装飾は下記コンポーネントを使う。

## front-matter

| キー | 必須 | 説明 |
| --- | --- | --- |
| `title` | ✓ | プレーンなタイトル（ページ`<title>`・RSS用） |
| `date` | ✓ | 公開日 `YYYY-MM-DD`（一覧の並び順） |
| `category` | ✓ | 一覧のカテゴリ表示（例: `DATABASE`） |
| `tags` | ✓ | 一覧・RSSのタグ配列 |
| `summary` | ✓ | 一覧カード・RSSの要約 |
| `listTitle` | | 一覧カードの見出し（未指定なら`title`） |
| `kicker` | | ヒーローの "Study Notes ·" に続く語 |
| `heroTitle` | | ヒーロー見出し。`<br>`や`<span class="em/v">`でHTML装飾可 |
| `sub` | | ヒーローのサブ文（HTML可） |
| `metaTags` | | ヒーロー下のタグ群 |
| `footerNote` | | フッターの一行（例: `database design · performance`） |
| `disclaimer` | | フッターの注意書き（HTML可） |
| `draft` | | `true` でビルド対象外 |

## 本文の書き方

- **章** = `## 見出し`。目次(TOC)と `01` 採番は自動。章の**先頭段落がリード文**になる。
- **小見出し** = `### 見出し`
- 箇条書き `-` → デザイン済みリスト / 表 → デザイン済みテーブル / ` ```lang ` → シンタックスハイライト
- `**太字**` は黒。青/赤で強調は `<strong class="acc">` / `<strong class="v">`

### コンポーネント（import 不要、そのまま使える）

| 記法 | 見た目 |
| --- | --- |
| `<Card label="...">…</Card>` | カード。`variant="v"`(赤)/`"amber"`(橙) |
| `<Note label="⚠ …">…</Note>` | 注意（橙）コールアウト |
| `<Tip label="▶ …">…</Tip>` | 補足（青）コールアウト |
| `<Flow><FNode>…</FNode><Arr/><FNode hl>…</FNode></Flow>` | 横並びフロー |
| `<Mono>…</Mono>` | 等幅フォントの強調 |

凝った図（timeline / pyramid / 3カラム / tools / sumcard 等）は、`common.css` の
クラスを使った**生HTMLをMDXに直接書ける**（既存記事 `intrusion-techniques.mdx` 参照）。

## 仕組み

- Astro + `@astrojs/mdx`。`src/content/notes/*.mdx` が単一ソース。
- `src/plugins/rehype-sections.mjs` が `##` ごとに `<section>` 化＋採番。
- 一覧 (`src/pages/index.astro`) と RSS (`src/pages/rss.xml.js`) は全記事から自動生成。
- `npm run build` → `dist/` を GitHub Actions が Pages へデプロイ。
