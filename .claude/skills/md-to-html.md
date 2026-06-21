# md-to-html

マークダウンファイルから、共通スタイルを使用したHTMLファイルを生成します。

## 使い方

```
/md-to-html <マークダウンファイルのパス>
```

例:
```
/md-to-html original-memo/rdb.md
```

## 動作

1. 指定されたマークダウンファイルを読み込む
2. マークダウンをパースして構造を抽出:
   - タイトル（最初の # 見出し）
   - 章（## 見出し）とその内容
   - リスト、コードブロック、テーブルなど
3. 既存のHTML構造を踏襲したHTMLを生成:
   - 共通CSS (`../styles/common.css`) をリンク
   - ヒーローセクション
   - 目次（TOC）
   - セクションごとの内容
   - フッター
4. `notes/` ディレクトリに出力

## 生成されるHTML構造

- メタデータ（title, description）
- Google Fontsのリンク
- 共通CSSのリンク
- ヒーローセクション（kicker, title, sub, meta-row）
- 目次（nav.toc）
- セクション（各章ごとに section タグ）
- フッター
- IntersectionObserverによるrevealアニメーション

## 注意

- マークダウンの見出し構造（#, ##, ###）に従って自動的にセクション分けされます
- タイトルやdescriptionはマークダウンの最初の部分から自動抽出されます
- 既存のHTMLと同じデザインシステムを使用します
