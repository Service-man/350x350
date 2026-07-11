import type { IngestQuery, RawMention, SourceAdapter } from "../types";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Official YouTube Data API v3 (free quota tier). Searches ownership/problem
// videos for each model; titles + descriptions become mentions. Dormant until
// YOUTUBE_API_KEY is set.
export const youtubeAdapter: SourceAdapter = {
  id: "youtube",
  label: "YouTube Data API",
  complianceNote: "Official Google API with quota controls. Video titles and descriptions only; no scraping.",
  requiredEnv: ["YOUTUBE_API_KEY"],
  isConfigured() {
    return Boolean(process.env.YOUTUBE_API_KEY);
  },
  async fetchRaw(query: IngestQuery): Promise<RawMention[]> {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return [];

    const mentions: RawMention[] = [];
    for (const term of query.searchTerms) {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("q", term);
      url.searchParams.set("type", "video");
      url.searchParams.set("maxResults", "25");
      url.searchParams.set("relevanceLanguage", "en");
      url.searchParams.set("key", key);

      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) continue; // quota or transient error: skip quietly, next run retries

      const json = (await response.json()) as {
        items?: { id?: { videoId?: string }; snippet?: { title?: string; description?: string; publishedAt?: string } }[];
      };
      for (const item of json.items ?? []) {
        const videoId = item.id?.videoId;
        if (!videoId) continue;
        mentions.push({
          externalId: `yt-${videoId}`,
          text: `${item.snippet?.title ?? ""}. ${item.snippet?.description ?? ""}`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: item.snippet?.publishedAt ?? null,
          sourceType: "youtube"
        });
      }
      await pause(250); // stay polite with quota
    }
    return mentions;
  }
};
