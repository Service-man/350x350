import { createClient } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import type { KundliChat, KundliMessage, KundliMeta } from "@/lib/types";

// Chat persistence. In demo mode nothing is stored: the chat still works, the
// browser simply carries the transcript for the session.

function demoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function latestChat(userId: string): Promise<KundliChat | null> {
  if (isDemoSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("kundli_chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as KundliChat) ?? null;
}

export async function getChat(userId: string, chatId: string): Promise<KundliChat | null> {
  if (isDemoSupabaseConfig()) return { id: chatId, user_id: userId, bike_id: null, title: null, created_at: "", updated_at: "" };
  const supabase = await createClient();
  const { data } = await supabase.from("kundli_chats").select("*").eq("id", chatId).eq("user_id", userId).maybeSingle();
  return (data as KundliChat) ?? null;
}

export async function newChat(userId: string, bikeId: string | null): Promise<KundliChat> {
  if (isDemoSupabaseConfig()) {
    return { id: demoId("demo-chat"), user_id: userId, bike_id: bikeId, title: null, created_at: "", updated_at: "" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kundli_chats")
    .insert({ user_id: userId, bike_id: bikeId, title: "Kundli reading" })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not start a chat.");
  return data as KundliChat;
}

export async function getOrCreateChat(userId: string, bikeId: string | null, chatId?: string | null): Promise<KundliChat> {
  if (chatId) {
    const existing = await getChat(userId, chatId);
    if (existing) return existing;
  }
  const latest = await latestChat(userId);
  return latest ?? newChat(userId, bikeId);
}

export async function listMessages(chatId: string): Promise<KundliMessage[]> {
  if (isDemoSupabaseConfig()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("kundli_messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
  return (data as KundliMessage[]) ?? [];
}

export async function addMessage(
  chat: KundliChat,
  userId: string,
  role: "user" | "assistant",
  content: string,
  extra: { attachment_name?: string | null; meta?: KundliMeta | null } = {}
): Promise<KundliMessage> {
  const row = {
    chat_id: chat.id,
    user_id: userId,
    role,
    content,
    attachment_name: extra.attachment_name ?? null,
    meta: extra.meta ?? null
  };
  if (isDemoSupabaseConfig()) {
    return { id: demoId("demo-msg"), created_at: new Date().toISOString(), ...row };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("kundli_messages").insert(row).select("*").single();
  if (error || !data) throw new Error(error?.message ?? "Could not save the message.");
  // Bump the chat so "latest chat" ordering stays correct.
  await supabase.from("kundli_chats").update({ updated_at: new Date().toISOString() }).eq("id", chat.id);
  return data as KundliMessage;
}
