import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { KundliChat } from "@/components/KundliChat";
import { requireUser } from "@/lib/supabase/server";
import { isDemoSupabaseConfig } from "@/lib/supabase/config";
import { loadKundliContext } from "@/lib/kundli/context";
import { latestChat, listMessages } from "@/lib/kundli/store";
import { isKundliAiConfigured } from "@/lib/kundli/llm";

export const metadata: Metadata = {
  title: "Kundli — BikeKundli",
  description: "Upload your service bills, answer a few riding questions, and read what's written in your bike's future."
};

export const dynamic = "force-dynamic";

// The main surface of the app: the chat that reads a bike's past and predicts
// its next failures. Lives inside the garage shell because it needs the
// rider's bikes and logs.
export default async function KundliPage() {
  const user = await requireUser();
  const ctx = await loadKundliContext(user.id);
  const chat = await latestChat(user.id);
  const messages = chat ? await listMessages(chat.id) : [];

  const bay = ctx.bike
    ? { title: ctx.bike.model, meta: `${new Intl.NumberFormat("en-IN").format(ctx.bike.odometer_km)} km${ctx.bike.manufacturing_year ? ` · ${ctx.bike.manufacturing_year} batch` : ""}` }
    : undefined;

  return (
    <AppShell title="Kundli" subtitle="Your bike's past, read forward — bills in, predictions out." bay={bay}>
      <KundliChat
        initialChatId={chat?.id ?? null}
        initialMessages={messages}
        bikes={ctx.bikes}
        initialBikeId={ctx.bike?.id ?? null}
        demo={isDemoSupabaseConfig()}
        aiConfigured={isKundliAiConfigured()}
      />
    </AppShell>
  );
}
