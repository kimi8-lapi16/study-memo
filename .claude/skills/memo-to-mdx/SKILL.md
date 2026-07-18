---
name: memo-to-mdx
description: original-memo/ の生メモ（.md）を、共通デザインの記事ページ・一覧・RSS が自動生成される src/content/notes/ の MDX に整形・変換する。ユーザーが「このメモをmdxにして」「記事にして」「original-memo の <slug> を変換」等と言ったとき。
---

# memo-to-mdx

`original-memo/<slug>.md` の下書きメモを読み、共通デザインの MDX 記事
（`src/content/notes/<slug>.mdx`）に整形する。MDX が単一ソースとなり、
記事ページ・トップの一覧・RSS はビルド時に自動生成される。手書きHTMLは不要。

## ワークフロー

1. **元メモを読む** — 対象が未指定なら `original-memo/` を `ls` して確認する。
   `original-memo/<slug>.md` を Read し、章立て・要点を把握する。

2. **雛形を作る**（既存 MDX が無い場合）:

   ```
   npm run new -- <slug> "記事タイトル"
   ```

   → `src/content/notes/<slug>.mdx` ができる。slug は元メモのファイル名に合わせる。

3. **front-matter を埋める** — 下表参照。`date` は today、`category`/`tags` は内容から。
   `heroTitle`/`sub` は `<br>` や `<span class="em">`（緑）/`<span class="v">`（朱）で装飾可。

4. **本文を整形** — 元メモの箇条書きを、章立て＋リード文＋コンポーネントで読み物にする。
   単なる箇条書きの羅列にせず、各章の先頭に説明段落（リード文）を置く。

5. **ビルド確認**:

   ```
   npm run build      # CIと同じ。エラーが出ないこと
   ```

   必要なら `npm run dev`（http://localhost:4321/study-memo/）でプレビュー。

## front-matter

| キー | 必須 | 説明 |
| --- | --- | --- |
| `title` | ✓ | プレーンなタイトル（`<title>`・RSS用） |
| `date` | ✓ | 公開日 `YYYY-MM-DD`（一覧の並び順） |
| `category` | ✓ | 一覧のカテゴリ表示（例: `DATABASE`） |
| `tags` | ✓ | タグ配列 |
| `summary` | ✓ | 一覧カード・RSSの2〜3行要約 |
| `listTitle` | | 一覧カードの見出し（未指定なら `title`） |
| `kicker` | | ヒーローの "Study Notes ·" に続く語 |
| `heroTitle` | | ヒーロー見出し。HTML装飾可 |
| `sub` | | ヒーローのサブ文（HTML可） |
| `metaTags` | | ヒーロー下のタグ群 |
| `footerNote` | | フッターの一行（例: `// database design ...`） |
| `disclaimer` | | フッターの注意書き（HTML可） |
| `draft` | | `true` でビルド対象外 |

スキーマの実体は `src/content.config.ts`。完成例は `src/content/notes/sql-antipatterns.mdx`。

## 本文の書き方

- **章** = `## 見出し`。目次(TOC)と `// 01` 採番は自動。**各章の先頭段落がリード文**。
- **小見出し** = `### 見出し`
- 箇条書き `-` → ▸ リスト / 表 → デザイン済みテーブル / ` ```lang ` → シンタックスハイライト
- `**太字**` は白。緑/朱で強調は `<strong class="acc">` / `<strong class="v">`

### コンポーネント（import 不要）

| 記法 | 用途 |
| --- | --- |
| `<Card label="...">…</Card>` | カード。`variant="v"`(朱)/`"amber"`(橙) |
| `<Note label="⚠ …">…</Note>` | 注意（橙）コールアウト |
| `<Tip label="▶ …">…</Tip>` | 補足（緑）コールアウト |
| `<Flow><FNode>…</FNode><Arr/><FNode hl>…</FNode></Flow>` | 横並びフロー |
| `<Mono>…</Mono>` | 等幅・シアンの強調 |

凝った図（timeline / pyramid / 3カラム 等）は `common.css` のクラスで生HTMLを直接書ける
（`src/content/notes/intrusion-techniques.mdx` 参照）。

## 整形の方針

- 元メモは箇条書き中心の走り書き。**そのまま貼らず**、要点を保ったまま文章化する。
- 各章は「リード段落 → 詳細（箇条書き/表/小見出し）→ 必要なら Card/Note/Tip で補足」。
- 元メモに無い事実を捏造しない。曖昧な点は膨らませず、要点の整理・言い換えに留める。
- 完成後は必ず `npm run build` を通す。
