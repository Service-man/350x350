import type { IngestQuery, RawMention, SourceAdapter } from "../types";

const USER_AGENT = "web:350x-garage:v0.2 (compliant ownership-issue research)";

async function getAccessToken(clientId: string, clientSecret: string) {
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": USER_AGENT
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) return null;
  const json = (await response.json()) as { access_token?: string };
  return json.access_token ?? null;
}

// Official Reddit OAuth API (script credentials, free tier). One rate-limited
// search per term against the public search endpoint. Dormant until
// REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET are set.
export const redditAdapter: SourceAdapter = {
  id: "reddit",
  label: "Reddit API",
  complianceNote: "Official OAuth API within free rate limits. Public posts only; permalinks stored for provenance.",
  requiredEnv: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
  isConfigured() {
    return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
  },
  async fetchRaw(query: IngestQuery): Promise<RawMention[]> {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    if (!clientId || !clientSecret) return [];

    const token = await getAccessToken(clientId, clientSecret);
    if (!token) return [];

    const mentions: RawMention[] = [];
    for (const term of query.searchTerms) {
      const url = new URL("https://oauth.reddit.com/search");
      url.searchParams.set("q", term);
      url.searchParams.set("limit", "25");
      url.searchParams.set("sort", "relevance");
      url.searchParams.set("t", "year");

      const response = await fetch(url, {
        headers: { authorization: `Bearer ${token}`, "user-agent": USER_AGENT }
      });
      if (!response.ok) continue;

      const json = (await response.json()) as {
        data?: {
          children?: {
            data?: { id?: string; title?: string; selftext?: string; permalink?: string; created_utc?: number };
          }[];
        };
      };
      for (const child of json.data?.children ?? []) {
        const post = child.data;
        if (!post?.id) continue;
        mentions.push({
          externalId: `rd-${post.id}`,
          text: `${post.title ?? ""}. ${(post.selftext ?? "").slice(0, 600)}`,
          url: `https://www.reddit.com${post.permalink ?? ""}`,
          publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
          sourceType: "reddit"
        });
      }
    }
    return mentions;
  }
};
