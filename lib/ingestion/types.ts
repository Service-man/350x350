// Pluggable, compliance-first ingestion contracts.
//
// Every source implements SourceAdapter behind the same interface so the
// pipeline, the /data-sources status page, and future sources never need
// consumer changes. Adapters must:
//   - stay dormant (isConfigured() === false, no network) until their keys exist
//   - use official APIs or clearly-public feeds only — no login-walled or
//     ToS-violating scraping, and never Facebook/Instagram
//   - return provenance (a public URL per mention) so every stored claim is
//     auditable

export type IngestSourceId = "youtube" | "reddit" | "rss";

export type RawMention = {
  externalId: string;
  text: string;
  url: string;
  publishedAt: string | null;
  sourceType: IngestSourceId;
};

export type IngestQuery = {
  brand: string;
  model: string;
  searchTerms: string[];
};

export interface SourceAdapter {
  id: IngestSourceId;
  label: string;
  complianceNote: string;
  /** Names of the env vars that switch this adapter on (for docs/status UI). */
  requiredEnv: string[];
  isConfigured(): boolean;
  fetchRaw(query: IngestQuery): Promise<RawMention[]>;
}
