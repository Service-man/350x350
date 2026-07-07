import type { IngestQuery, RawMention, SourceAdapter } from "../types";

function stripMarkup(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? stripMarkup(match[1]) : "";
}

// Public RSS/Atom feeds (OEM newsrooms, recall bulletins, moto publications).
// Best-effort tag extraction with no XML dependency; items are matched to a
// model by name. Dormant until RSS_FEED_URLS (comma-separated) is set.
export const rssAdapter: SourceAdapter = {
  id: "rss",
  label: "RSS / Atom feeds",
  complianceNote: "Feeds are published for syndication. Configure only feeds whose terms permit reuse; item links stored for provenance.",
  requiredEnv: ["RSS_FEED_URLS"],
  isConfigured() {
    return Boolean(process.env.RSS_FEED_URLS);
  },
  async fetchRaw(query: IngestQuery): Promise<RawMention[]> {
    const feeds = (process.env.RSS_FEED_URLS ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (feeds.length === 0) return [];

    const mentions: RawMention[] = [];
    const modelNeedle = query.model.toLowerCase();

    for (const feed of feeds) {
      try {
        const response = await fetch(feed, { headers: { accept: "application/rss+xml, application/xml, text/xml" } });
        if (!response.ok) continue;
        const xml = await response.text();
        const items = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];

        for (const item of items) {
          const title = extractTag(item, "title");
          const description = extractTag(item, "description") || extractTag(item, "summary");
          const text = `${title}. ${description}`;
          if (!text.toLowerCase().includes(modelNeedle)) continue;

          const link =
            extractTag(item, "link") || item.match(/<link[^>]*href="([^"]+)"/i)?.[1] || feed;
          mentions.push({
            externalId: `rss-${extractTag(item, "guid") || title}`,
            text,
            url: link,
            publishedAt: extractTag(item, "pubDate") || extractTag(item, "updated") || null,
            sourceType: "rss"
          });
        }
      } catch {
        // Unreachable or malformed feed: skip, next run retries.
      }
    }
    return mentions;
  }
};
