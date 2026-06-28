import "server-only";

export function checkDeletePassword(password: string): string | null {
  const expected = process.env.DELETE_PASSWORD;
  if (!expected) return "DELETE_PASSWORDが設定されていません。";
  if (password !== expected) return "パスワードが正しくありません。";
  return null;
}
