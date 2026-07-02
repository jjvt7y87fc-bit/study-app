export type AvatarOption = { value: string; label: string };

export const AVATAR_BASES: AvatarOption[] = [
  { value: "🧑", label: "せいねん" },
  { value: "👨", label: "だんせい" },
  { value: "👩", label: "じょせい" },
  { value: "👦", label: "だんのこ" },
  { value: "👧", label: "おんなのこ" },
  { value: "👴", label: "おじいちゃん" },
  { value: "👵", label: "おばあちゃん" },
];

// ZWJ (‍) を含めた値なので、そのまま base の後ろに連結すればよい
export const AVATAR_HAIRSTYLES: AvatarOption[] = [
  { value: "", label: "デフォルト" },
  { value: "‍\u{1F9B1}", label: "くせ毛（黒髪系）" },
  { value: "‍\u{1F9B0}", label: "赤髪" },
  { value: "‍\u{1F9B3}", label: "白髪" },
  { value: "‍\u{1F9B2}", label: "はげ" },
];

export const AVATAR_SKIN_TONES: AvatarOption[] = [
  { value: "", label: "デフォルト" },
  { value: "\u{1F3FB}", label: "明るい肌" },
  { value: "\u{1F3FC}", label: "やや明るい肌" },
  { value: "\u{1F3FD}", label: "中間の肌" },
  { value: "\u{1F3FE}", label: "やや濃い肌" },
  { value: "\u{1F3FF}", label: "濃い肌" },
];

export function composeAvatar(base: string, skinTone: string, hairstyle: string): string {
  return `${base}${skinTone}${hairstyle}`;
}
