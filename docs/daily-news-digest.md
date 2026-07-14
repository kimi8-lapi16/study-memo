# 毎日のITニュースダイジェスト自動生成

このドキュメントは、毎朝7:00（JST）に自動実行される「今日のITニュースダイジェスト」記事
生成フローの仕様。`.github/workflows/daily-news-digest.yml`（GitHub Actionsのcron）が
Claude Code Actionを起動し、この仕様に従って `src/content/notes/news-YYYY-MM-DD.mdx` を
1本作成する。

このリポジトリは `master` への変更にPRを必須とするルールが設定されているため、
**masterへの直接pushはできない**。そのため自動生成フローは「専用ブランチにpush →
masterへのPRを自動作成」までを行い、**PRのマージはリポジトリオーナーが手動で行う**
（読む→問題なければマージ、というレビュー運用）。

## セットアップ（初回のみ）

このワークフローはClaude Pro/MaxサブスクリプションのOAuthトークンで動く（従量課金の
APIキーは使わない）。

1. Claude Codeがインストールされた端末で `claude setup-token` を実行し、トークンを発行する。
2. GitHubリポジトリの Settings → Secrets and variables → Actions → New repository secret で
   `CLAUDE_CODE_OAUTH_TOKEN` という名前でそのトークンを登録する。
3. トークンが失効した場合は `claude setup-token` を再実行し、Secretの値を更新する。

## 対象ジャンル

以下8ジャンルのニュースのみを対象にする。国内・海外どちらの話題も対象。

1. **新技術紹介** … 新しいプロダクト・言語機能・サービスの発表など（AI・クラウド・開発
   ツールは下記の専用ジャンルを優先）
2. **AI・LLM動向** … モデルリリース、エージェント技術、AI開発ツール、主要企業のAI戦略など
3. **開発ツール・言語・OSS動向** … 言語/フレームワークのメジャーリリース、OSSのライセンス
   変更・ガバナンス問題、主要製品のEOL（サポート終了）など
4. **クラウド・大規模障害** … AWS/GCP/Azureの新サービス・価格改定、大規模障害とその
   ポストモーテム（障害報告書）など
5. **業界動向** … IT企業の買収・合併・大型提携、主要サービスの終了・方針転換など
   技術選定に影響するビジネスニュース
6. **法改正・規制動向** … IT/デジタル関連の法改正、ガイドライン改定、行政処分（国内に加え、
   EU AI法・GDPR執行など日本のIT事業者に実務上影響する海外の主要規制も対象）
7. **訴訟・トラブル** … 著作権/特許訴訟、規約違反、システム障害の紛争化など（国内・海外の
   主要な訴訟・判例を含む）
8. **セキュリティインシデント・脆弱性** … 重大な脆弱性の公表、大規模情報漏洩、ランサムウェア
   被害など（訴訟に発展していない段階のインシデントも対象）

上記に当てはまらない一般的なビジネスニュース（業績発表のみ等）や採用系ニュースは対象外。

### ジャンル配分ルール

- **セキュリティインシデント・脆弱性は1日最大3件まで。** セキュリティ系の記事は情報源の
  性質上たくさん見つかるが、上限を超える分は重要度の高いものだけに絞り、残りの枠は
  他ジャンルから探すこと。
- 1ジャンルに偏らせず、できるだけ複数ジャンルからバランスよく採用する。

## 情報源（この中からのみ拾う）

**新技術紹介**
- ITmedia NEWS（https://www.itmedia.co.jp/news/）
- Publickey（https://www.publickey1.jp/）
- ASCII.jp（https://ascii.jp/）
- Impress Watch（INTERNET Watch / Cloud Watch）（https://www.watch.impress.co.jp/）
- GIGAZINE（https://gigazine.net/）
- ZDNET Japan（https://japan.zdnet.com/）
- TechCrunch Japan（https://jp.techcrunch.com/）

**AI・LLM動向**
- ITmedia AI+（https://www.itmedia.co.jp/aiplus/）
- Publickey（上記と同じ）
- 主要AI企業の公式ブログ（OpenAI / Anthropic / Google / Meta等。一次情報として）

**開発ツール・言語・OSS動向**
- Publickey（上記と同じ）
- gihyo.jp（https://gihyo.jp/）
- CodeZine（https://codezine.jp/）
- 各言語・フレームワークの公式ブログ/リリースノート（一次情報として）

**クラウド・大規模障害**
- Publickey（上記と同じ）
- AWS What's New（https://aws.amazon.com/jp/new/）
- Google Cloud Blog（https://cloud.google.com/blog/）
- Microsoft Azure Updates（https://azure.microsoft.com/ja-jp/updates/）
- 日経クロステック（https://xtech.nikkei.com/）

**業界動向**
- 日経クロステック（上記と同じ）
- ITmedia NEWS（上記と同じ）
- Reuters Technology（https://www.reuters.com/technology/）
- TechCrunch Japan（上記と同じ）

**法改正・規制動向（国内＋海外）**
- 個人情報保護委員会 プレスリリース（https://www.ppc.go.jp/news/press/）
- 総務省 報道資料（https://www.soumu.go.jp/menu_news/）
- デジタル庁 お知らせ（https://www.digital.go.jp/news）
- 経済産業省 プレスリリース（https://www.meti.go.jp/press/）
- Reuters Technology（https://www.reuters.com/technology/）
- Bloomberg Law（https://news.bloomberglaw.com/）

**訴訟・トラブル（国内＋海外）**
- 日経クロステック（https://xtech.nikkei.com/）
- ITmedia NEWS（上記と同じ）
- 弁護士ドットコムニュース IT/知財（https://www.bengo4.com/times/）
- Reuters Technology（上記と同じ）
- Bloomberg Law（上記と同じ）

**セキュリティインシデント・脆弱性**
- JPCERT/CC 注意喚起（https://www.jpcert.or.jp/）
- IPA 重要なセキュリティ情報（https://www.ipa.go.jp/security/）
- BleepingComputer（https://www.bleepingcomputer.com/）
- ITmedia NEWS（上記と同じ）

WebSearch/WebFetchで上記サイトの直近24時間程度の更新を確認する。上記以外のソースでしか
出ていない情報は採用しない（一次情報の裏取りとして上記以外のサイトを参照するのは可）。

## 収集期間・件数

- 前回実行（前日朝7:00 JST）以降、今回の実行直前までに出た記事を対象とする。
- 採用件数の目安は **ニュース3〜8件 + 今日のTips 1件**。価値のあるニュースが1件も無ければ
  **その日は記事を作らずスキップ**してよい（無理に埋め草を作らない。その場合Tipsも出さない）。
- 同じニュースの続報が出た場合は、以前のダイジェストで扱った内容の繰り返しにならないよう
  「その後の進展」に絞って書く。

## 今日のTips（毎日1件）

ニュースとは別に、記事の**最後の章**として「今日のTips」を1件書く。リポジトリオーナーの
技術スタックに関する実務Tipsのコーナー。

**対象技術（この中から毎日1つ選ぶ）**: TypeScript / JavaScript(Node.js) / React / NestJS /
Prisma / PostgreSQL

**内容の例**（この粒度・テイストで）:
- PrismaのupsertはDBレベルでアトミックになるとは限らない、という落とし穴
- PostgreSQL 11以降はデフォルト値付きカラム追加でテーブル書き換えが不要になった、という仕様変更
- NestJSのSwagger CLIプラグインでデコレータ記述を大幅に省略できる、という便利機能
- Reactの設計思想（宣言的UI・単方向データフロー）のような概念の解説
- TypeScriptの型パズル1問（問題＋解答＋解説）

**ルール**:
- 見出しは `## 今日のTips: <内容がわかるタイトル>` とする（記事の最終章に置く）。
- **正確性を最優先する。** 公式ドキュメント・公式ブログ・リリースノート等で裏取りできた
  内容のみ書き、末尾に `参考: [名称](URL)` として裏取り先のリンクを付ける。WebFetchで
  実際に確認していない内容・URLは書かない。うろ覚えの仕様やバージョン番号を裏取りなしで
  断言しない。
- TypeScript型パズルのような自作問題の場合は、参考リンクの代わりに解答コードが正しいことを
  確認する（リポジトリにTypeScriptが入っているので `npx tsc --noEmit` 等で検証できる）。
- 直近2週間分の `news-*.mdx` の「今日のTips」を確認し、**同じ技術が連続しないよう
  ローテーション**し、過去に書いた内容と重複させない。
- コード例は短く（10行程度まで）。`<Tip>` コンポーネントを補足に使ってよい。

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
- 本文でジャンル（新技術／AI／開発ツール／クラウド／業界動向／法改正／訴訟／セキュリティ）が
  分かるように一言触れる。
- 記事の最後に必ず出典を明記する: `出典: [メディア名](URL)` の形式（複数ソースがあれば
  列挙）。実際にWebFetchで内容を確認していないURLは書かない。
- 既存記事と同じトーン（だ・である調、簡潔な解説文）に合わせる。誇張や断定しすぎた
  見出しは避ける。
- 既存の `<Card>` `<Note>` `<Tip>` は多用しない。ニュースダイジェストなので基本は
  見出し+本文+出典のシンプルな構成でよい。重要な注意点がある場合のみ `<Note>` を使う。

## 公開手順（ブランチ + PR）

このワークフローは `.github/workflows/daily-news-digest.yml` の中で実行され、リポジトリは
すでにmasterブランチでcheckout済みの状態からスタートする。`gh` CLI が使用可能で認証済み。

1. `git checkout -b news/YYYY-MM-DD` で専用ブランチを作る。
2. 記事ファイル `src/content/notes/news-YYYY-MM-DD.mdx` を作成する。
3. `npm ci`（未インストールの場合）→ `npm run build` を実行し、ビルドが通ることを確認する。
   **ビルドが失敗する場合はブランチのpush・PR作成をしない。** front-matterやMDX構文を
   見直して再度ビルドを通す。それでも解決しなければ、記事ファイルを削除して終了する。
4. `git add src/content/notes/news-YYYY-MM-DD.mdx` → コミット
   （例: `news: YYYY-MM-DD のITニュースダイジェストを追加`）
   → `git push -u origin news/YYYY-MM-DD`。
5. `gh pr create --base master --head news/YYYY-MM-DD --title "..." --reviewer kimi8-lapi16 --body "..."`
   でPRを作成する。
   - タイトル例: `news: ITニュースダイジェスト YYYY-MM-DD`
   - レビュワーとしてリポジトリオーナー（kimi8-lapi16）を必ず指定する。
   - 本文には、その日採用したニュースのタイトルと出典URL、および「今日のTips」のテーマを
     箇条書きで入れる（レビューしやすくするため）。
6. PRのマージはリポジトリオーナーが手動で行う。マージされると `.github/workflows/deploy.yml`
   が自動でビルド・GitHub Pagesへのデプロイを行う。

## 失敗時のふるまい

- 対象ジャンルで価値のあるニュースが見つからない日は、記事もブランチもPRも作らずに終了して
  よい。
- 一部の情報源に接続できない場合は、取得できたソースの範囲で作成する。
- `npm run build` が通らない場合は原因を修正して再ビルドし、それでも解決しない場合は
  ブランチをpushせず・PRも作らずに終了する（サイトを壊さないことを最優先する）。
