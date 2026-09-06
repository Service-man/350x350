import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  // unpdf (PDF text extraction for the kundli) is ESM that webpack can't
  // bundle cleanly; let Node resolve it at runtime on the server instead.
  serverExternalPackages: ["unpdf"]
};

export default nextConfig;
