import { supabase } from "@/lib/supabase";
import { getAllProfiles } from "@/lib/profile";
import type { Kanji } from "@/lib/types";
import SettingsTabs from "@/app/settings/SettingsTabs";
import KanjiManagePanel from "@/app/settings/KanjiManagePanel";
import UserManagePanel from "@/app/settings/UserManagePanel";

export const dynamic = "force-dynamic";

async function getKanjiList(): Promise<Kanji[]> {
  const { data, error } = await supabase
    .from("kanji")
    .select("*")
    .order("grade", { ascending: true })
    .order("character", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function SettingsPage() {
  const [kanjiList, profiles] = await Promise.all([getKanjiList(), getAllProfiles()]);

  return (
    <SettingsTabs
      kanjiPanel={<KanjiManagePanel kanjiList={kanjiList} />}
      userPanel={<UserManagePanel profiles={profiles} />}
    />
  );
}
