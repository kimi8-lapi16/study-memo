#!/usr/bin/env node
/**
 * 日次ITニュースダイジェストの「決まった手順」部分をまとめたスクリプト。
 * 記事本文の執筆（情報収集・要約）だけをAIに任せ、日付の確定・既存チェック・
 * ビルド検証・commit/push はここで機械的に行う。仕様は docs/daily-news-digest.md。
 *
 *   npm run news:prepare                # 今日（JST）の記事パスと既存有無を表示
 *   npm run news:publish                # ビルド検証 → 記事のみcommit → masterへpush
 *   npm run news:publish -- --no-push   # pushせずcommitまで（動作確認用）
 *
 * どちらも `--date YYYY-MM-DD` で日付を上書きできる（動作確認用）。
 *
 * prepare は1行目に JSON（date / yyyymm / file / exists）を出力する。
 * exists が true なら今日分は公開済みなので、記事を作らずに終了すること。
 */
import { access, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const [, , command, ...args] = process.argv;
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

// 実行環境のシステム時計はUTCのことが多く、朝のJSTはUTCではまだ前日になる。
// 日付の解釈をAIに任せると取り違えるため、ここでJSTの日付を確定させる
function todayJst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

function resolveTarget() {
  const date = option("--date") ?? todayJst();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`日付は YYYY-MM-DD 形式で指定する: ${date}`);
    process.exit(1);
  }
  const yyyymm = date.slice(0, 4) + date.slice(5, 7);
  const file = join("src", "content", "notes", "news", yyyymm, `news-${date}.mdx`);
  return { date, yyyymm, file };
}

async function exists(path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

function run(cmd, cmdArgs, opts = {}) {
  console.error(`$ ${cmd} ${cmdArgs.join(" ")}`);
  return execFileSync(cmd, cmdArgs, { cwd: root, stdio: "inherit", ...opts });
}

function git(...gitArgs) {
  return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8" }).trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function prepare() {
  const target = resolveTarget();
  const already = await exists(target.file);
  if (!already) await mkdir(join(root, dirname(target.file)), { recursive: true });
  console.log(JSON.stringify({ ...target, exists: already }));
  console.error(
    already
      ? `今日分（${target.file}）は既に存在する。記事を作らずに終了すること。`
      : `今日分の記事を ${target.file} に作成すること。`,
  );
}

async function publish() {
  const { date, file } = resolveTarget();
  if (!(await exists(file))) {
    console.error(`記事ファイルがない: ${file}`);
    process.exit(1);
  }

  if (!(await exists("node_modules"))) run("npm", ["ci"]);
  try {
    run("npm", ["run", "build"]);
  } catch {
    console.error(
      "ビルドに失敗した。記事を修正して再実行するか、修正できなければ記事を削除して終了すること。",
    );
    process.exit(1);
  }

  // 記事ファイル以外の変更（ビルド中に触ったファイル等）を巻き込まないよう、パスを限定してcommitする
  run("git", ["add", "--", file]);
  run("git", ["commit", "-m", `news: ${date} のITニュースダイジェストを追加`, "--", file]);

  if (flag("--no-push")) {
    console.log(JSON.stringify({ file, sha: git("rev-parse", "HEAD"), pushed: false }));
    return;
  }

  // non-fast-forward なら rebase して再push、ネットワークエラーは指数バックオフで再試行
  const delays = [2000, 4000, 8000, 16000];
  for (let attempt = 0; ; attempt++) {
    try {
      run("git", ["push", "origin", "HEAD:master"]);
      break;
    } catch {
      if (attempt >= delays.length) {
        console.error(
          "pushに失敗した。`git push -v origin HEAD:master` の出力で原因を確認すること。",
        );
        process.exit(1);
      }
      try {
        run("git", ["pull", "--rebase", "origin", "master"]);
      } catch {
        // rebaseが衝突したら元に戻し、次の試行に回す
        try {
          git("rebase", "--abort");
        } catch {}
      }
      await sleep(delays[attempt]);
    }
  }

  console.log(JSON.stringify({ file, sha: git("rev-parse", "HEAD"), pushed: true }));
}

const commands = { prepare, publish };
if (!commands[command]) {
  console.error(
    "使い方: node scripts/news-digest.mjs <prepare|publish> [--date YYYY-MM-DD] [--no-push]",
  );
  process.exit(1);
}
await commands[command]();
