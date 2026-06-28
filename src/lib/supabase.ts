import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください。"
  );
}

// 家庭内単一ユーザー利用のためログイン機能は無し。
// すべてのDB操作はサーバー側（Server Actions / Server Components）からのみ、
// service role キーで行うため、このクライアントは絶対にブラウザへ渡さないこと。
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
