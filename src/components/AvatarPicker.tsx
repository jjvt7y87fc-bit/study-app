"use client";

import { useState } from "react";
import { AVATAR_BASES, AVATAR_HAIRSTYLES, AVATAR_SKIN_TONES, composeAvatar } from "@/lib/avatarParts";

export default function AvatarPicker() {
  const [base, setBase] = useState(AVATAR_BASES[0].value);
  const [skinTone, setSkinTone] = useState("");
  const [hairstyle, setHairstyle] = useState("");
  const emoji = composeAvatar(base, skinTone, hairstyle);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm text-gray-600">タイプ</label>
        <select
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="rounded border px-3 py-2 text-lg"
        >
          {AVATAR_BASES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">髪型</label>
        <select
          value={hairstyle}
          onChange={(e) => setHairstyle(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {AVATAR_HAIRSTYLES.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">肌の色</label>
        <select
          value={skinTone}
          onChange={(e) => setSkinTone(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {AVATAR_SKIN_TONES.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-gray-600">プレビュー</span>
        <span className="text-4xl">{emoji}</span>
      </div>
      <input type="hidden" name="emoji" value={emoji} />
    </div>
  );
}
