-- 漢字テスト & 百マス計算アプリ用スキーマ
-- Supabase の SQL Editor でそのまま実行してください。

create extension if not exists "pgcrypto";

-- 漢字データ（学年配当表に基づき管理UIから手入力する）
-- grade: 1〜6=小学1〜6年, 7〜9=中学1〜3年, 10〜12=高校1〜3年
create table if not exists kanji (
  id uuid primary key default gen_random_uuid(),
  character text not null,
  readings text[] not null default '{}',
  grade smallint not null check (grade between 1 and 12),
  meaning text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kanji_grade_idx on kanji (grade);

-- 漢字クイズ結果
create table if not exists kanji_quiz_results (
  id uuid primary key default gen_random_uuid(),
  taken_at timestamptz not null default now(),
  grades smallint[] not null,
  total_count integer not null,
  correct_count integer not null,
  mistakes jsonb not null default '[]'
);

create index if not exists kanji_quiz_results_taken_at_idx on kanji_quiz_results (taken_at desc);

-- 間違えた単語の再出題スケジュール（スペースド・リピティション）
-- stage: 0=翌日に再出題待ち, 1=3日後に再出題待ち, 2=14日後に再出題待ち
-- 該当stageで正解すると次のstageに進み、stage2で正解すると行を削除（習得済み）。
-- 不正解の場合は常にstage0・翌日に戻す。
create table if not exists kanji_reviews (
  id uuid primary key default gen_random_uuid(),
  kanji_id uuid not null references kanji(id) on delete cascade,
  stage smallint not null default 0 check (stage in (0, 1, 2)),
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kanji_id)
);

create index if not exists kanji_reviews_due_date_idx on kanji_reviews (due_date);

-- 百マス計算結果
create table if not exists hyakumasu_results (
  id uuid primary key default gen_random_uuid(),
  taken_at timestamptz not null default now(),
  operation text not null check (operation in ('add', 'sub', 'mul')),
  time_seconds numeric(6, 1) not null,
  correct_count integer not null
);

create index if not exists hyakumasu_results_taken_at_idx on hyakumasu_results (taken_at desc);

-- 家庭内単一ユーザー利用のためログイン無し。
-- サーバー側（Next.js Server Actions）からのみ service role キーでアクセスするため、
-- RLS は有効化したまま「サーバーからの全操作を許可しない」状態（=service role はRLSを常にバイパス）でOK。
alter table kanji enable row level security;
alter table kanji_quiz_results enable row level security;
alter table hyakumasu_results enable row level security;
alter table kanji_reviews enable row level security;
