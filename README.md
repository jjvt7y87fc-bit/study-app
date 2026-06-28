# 学習アプリ（漢字テスト & 百マス計算）

小学生向けの家庭学習用Webアプリです。漢字の読みクイズと百マス計算ができ、結果はクラウド上のSupabase（Postgres）に保存されるため、PC・タブレット・スマホなど複数の端末から同じ履歴を見ることができます。家庭内・単一ユーザー利用を想定し、アプリ全体に共通の簡易パスワードをかけられます（個人認証ではなく、家族以外のアクセスを防ぐための簡易的なものです）。

## 機能

- **漢字テスト** (`/kanji`)
  - 学年（1〜6年生、複数選択可）でフィルタしてクイズを実施
  - 単語（1文字の漢字でも複数文字の熟語でもOK）をランダムな順で出題し、ひらがなで読みを入力して回答
  - 1回のテストは**10問間違えた時点で終了**します（全問を毎回出題し続けることはしません）
  - 間違えた単語は自動的に**翌日・3日後・14日後**に再出題され、各タイミングで正解すると次の間隔に進み、3回正解し続けると「習得済み」として出題対象から外れます。途中で間違えると翌日からやり直しになります
  - 結果（日時・対象学年・出題数・正解数・間違えた単語）をDBに保存
  - 単語データの追加・編集・削除は管理画面 (`/kanji/manage`) から。1件ずつの登録に加え、テキストをまとめて貼り付けて一括登録も可能
  - 過去のテスト結果一覧・正解率グラフ (`/kanji/history`)
- **百マス計算** (`/hyakumasu`)
  - 足し算・引き算・かけ算から選択し、10×10マスをランダム生成（引き算は答えが負にならないよう調整）
  - 0.1秒単位のタイマー、採点で正解数と所要時間を表示
  - 結果をDBに保存し、月別カレンダー (`/hyakumasu/calendar`) で日ごとの記録を確認可能

## 技術スタック

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase（Postgres）
- recharts（グラフ表示）
- Vercel（デプロイ想定）

データベースへの接続・操作はすべてサーバー側（Server Components / Server Actions）から `service role` キーで行うため、ブラウザにDB接続情報は一切露出しません。アプリへのアクセスは`proxy.ts`（Next.js 16のProxy機能）で簡易パスワード保護しています。

## 漢字データについて（重要）

このアプリには漢字データは1件も初期投入されていません。単語とその学年・読み方は、**文部科学省の「学年別漢字配当表」**などの公的・信頼できる情報源を確認しながら、`/kanji/manage` の管理画面から手入力してください。読み方も国語辞典等で確認し、不確かなものは登録しないでください。

民間の学習プリント配布サイトの教材を自動取得（スクレイピング）する機能は、利用規約上の懸念があるため意図的に実装していません。

## セットアップ手順

### 1. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. SQL Editor を開き、[`supabase/schema.sql`](supabase/schema.sql) の内容を実行してテーブルを作成
3. 「Project Settings」→「API」から以下を取得
   - `Project URL`
   - `service_role` キー（**anon キーではありません**。サーバーのみで使うため安全に管理してください）

### 2. ローカル開発

```bash
npm install
cp .env.local.example .env.local
# .env.local に SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY、APP_PASSWORD を設定
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて確認してください。`APP_PASSWORD`に設定した文字列が、アプリ全体にアクセスするためのパスワードになります。

### 3. Vercelへのデプロイ

1. このリポジトリをGitHubにpushし、Vercelでプロジェクトとしてインポート
2. Vercelの「Settings」→「Environment Variables」に以下を設定
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_PASSWORD`
3. デプロイを実行

デプロイ後は、スマホ・タブレット・PCなど異なる端末から同じURLにアクセスしても、Supabase上の同じデータ（漢字データ・テスト結果・百マス計算結果）が表示されます。

## パスワードについて

このアプリには個人ごとのログインはなく、`APP_PASSWORD`で設定した1つのパスワードをアプリ全体にかける簡易的な仕組みです。一度パスワードを入力すると、ブラウザにCookieが保存され約180日間は再入力不要です。家族以外の第三者からのアクセスを防ぐための簡易対策であり、重要な情報を保護するレベルのセキュリティではありません。

パスワードを変更したい場合は、`.env.local`（ローカル）またはVercelの環境変数（本番）の`APP_PASSWORD`を書き換えてください。

## データモデル

`supabase/schema.sql` 参照。

- `kanji`：id, character（単語）, readings（読み方の配列）, grade（学年）
- `kanji_quiz_results`：id, taken_at, grades（対象学年の配列）, total_count, correct_count, mistakes（jsonb）
- `kanji_reviews`：id, kanji_id, stage（0=翌日待ち/1=3日後待ち/2=14日後待ち）, due_date（次回出題予定日）
- `hyakumasu_results`：id, taken_at, operation（add/sub/mul）, time_seconds, correct_count
