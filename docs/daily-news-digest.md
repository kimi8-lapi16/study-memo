# 毎日のITニュースダイジェスト自動生成

このドキュメントは、毎朝7:00（JST）に自動実行される「今日のITニュースダイジェスト」記事
生成フローの仕様。Claude Codeのセッション（スケジュールトリガー）がこの仕様に従って
`src/content/notes/news-YYYY-MM-DD.mdx` を1本作成し、**masterへ直接push**して公開する
（PRは作らない・完全自動公開）。

## 対象ジャンル

以下3ジャンルのニュースのみを対象にする。

1. **新技術紹介** … 新しいプロダクト・OSS・言語機能・クラウドサービスの発表など
2. **法改正・規制動向** … IT/デジタル関連の法改正、ガイドライン改定、行政処分など
3. **訴訟・トラブル** … 情報漏洩、著作権/特許訴訟、規約違反、システム障害の紛争化など

上記に当てはまらない一般的なビジネスニュースや採用系ニュースは対象外。

## 情報源（この中からのみ拾う）

**新技術紹介**
- ITmedia NEWS（https://www.itmedia.co.jp/news/）
- Publickey（https://www.publickey1.jp/）
- ASCII.jp（https://ascii.jp/）
- Impress Watch（INTERNET Watch / Cloud Watch）（https://www.watch.impress.co.jp/）
- GIGAZINE（https://gigazine.net/）
- ZDNET Japan（https://japan.zdnet.com/）
- TechCrunch Japan（https://jp.techcrunch.com/）

**法改正・規制動向**
- 個人情報保護委員会 プレスリリース（https://www.ppc.go.jp/news/press/）
- 総務省 報道資料（https://www.soumu.go.jp/menu_news/）
- デジタル庁 お知らせ（https://www.digital.go.jp/news）
- 経済産業省 プレスリリース（https://www.meti.go.jp/press/）

**訴訟・トラブル**
- 日経クロステック（https://xtech.nikkei.com/）
- ITmedia NEWS（上記と同じ）
- 弁護士ドットコムニュース IT/知財（https://www.bengo4.com/times/）
- Reuters Technology（https://www.reuters.com/technology/）

WebSearch/WebFetchで上記サイトの直近24時間程度の更新を確認する。上記以外のソースでしか
出ていない情報は採用しない（一次情報の裏取りとして上記以外のサイトを参照するのは可）。

## 収集期間・件数

- 前回実行（前日朝7:00 JST）以降、今回の実行直前までに出た記事を対象とする。
- 採用件数の目安は **3〜8件**。価値のあるニュースが1件も無ければ **その日は記事を作らずスキップ**
  してよい（無理に埋め草を作らない）。
- 同じニュースの続報が出た場合は、以前のダイジェストで扱った内容の繰り返しにならないよう
  「その後の進展」に絞って書く。

## 重複チェック

新規記事を書く前に `src/content/notes/news-*.mdx` を確認し、同一の出来事を重複して
取り上げていないかを確認する（`grep` などで見出しやURLを検索）。既出の話題は続報がある
場合のみ扱う。

## ファイル・front-matter

- ファイル名: `src/content/notes/news-YYYY-MM-DD.mdx`（実行日の日付、JST基準）
- スキーマは `src/content.config.ts` を参照。以下のように埋める:

```yaml
---
title: ITニュースダイジェスト YYYY-MM-DD
listTitle: ITニュースダイジェスト YYYY-MM-DD — 今日拾った新技術・法改正・訴訟トピック。
date: YYYY-MM-DD
category: NEWS
tags: [NEWS, IT, その日扱ったトピックに応じて追加（例: AI, 法改正, セキュリティ）]
summary: その日拾った項目を1〜2行で要約（一覧・RSS用）。
kicker: Daily Digest
heroTitle: 'ITニュースダイジェスト<br><span class="em">YYYY-MM-DD</span>'
sub: 'その日押さえておきたいITニュースを新技術・法改正・訴訟の観点でまとめたダイジェスト。'
metaTags:
  - IT NEWS
  - （その日のトピックに応じたタグ）
footerNote: '// daily digest · auto-generated'
disclaimer: '※ 本記事はAIが上記情報源を基に自動収集・要約したニュースダイジェストです。要約には誤りを含む可能性があるため、詳細・正確な内容は各出典元でご確認ください。'
---
```

`disclaimer` の自動生成である旨の記載は必須（読者への透明性のため）。

## 本文の書き方

- ニュース1件 = `## 見出し`（そのニュースの内容が分かる見出し。ジャンル名そのものは
  見出しにしない）。目次と `// 01` 採番は既存の仕組みで自動生成される。
- 見出し直後の最初の段落がリード文になるので、そのニュースの要点を1〜2文で書く。
- 本文でジャンル（新技術／法改正／訴訟）が分かるように一言触れる。
- 記事の最後に必ず出典を明記する: `出典: [メディア名](URL)` の形式（複数ソースがあれば
  列挙）。実際にWebFetchで内容を確認していないURLは書かない。
- 既存記事と同じトーン（だ・である調、簡潔な解説文）に合わせる。誇張や断定しすぎた
  見出しは避ける。
- 既存の `<Card>` `<Note>` `<Tip>` は多用しない。ニュースダイジェストなので基本は
  見出し+本文+出典のシンプルな構成でよい。重要な注意点がある場合のみ `<Note>` を使う。

## 公開手順

1. `git fetch origin master && git checkout master && git pull origin master` で最新化。
2. 記事ファイルを作成する。
3. `npm ci`（初回のみ） → `npm run build` を実行し、ビルドが通ることを確認する。
   **ビルドが失敗する場合はpushしない。** front-matterやMDX構文を見直して再度ビルドを通す。
4. `git add src/content/notes/news-YYYY-MM-DD.mdx docs/daily-news-digest.md`（変更した
   ファイルのみ）→ コミット（例: `news: YYYY-MM-DD のITニュースダイジェストを追加`）
   → `git push origin master`。
5. push後、GitHub Actions（`.github/workflows/deploy.yml`）が自動でビルド・GitHub Pagesへの
   デプロイを行う。追加の作業は不要。

## 失敗時のふるまい

- 対象ジャンルで価値のあるニュースが見つからない日は、記事を作らずに終了してよい
  （何もpushしない）。
- 一部の情報源に接続できない場合は、取得できたソースの範囲で作成する。
- `npm run build` が通らない場合は原因を修正して再ビルドし、それでも解決しない場合は
  pushせずに終了する（サイトを壊さないことを最優先する）。
