import type { Config } from "tailwindcss";

// Design tokens from the platform redesign (Platform_design_redesign_1):
// near-black ink surfaces, violet accent, lavender-tinted paper and grays,
// Archivo type with monospace eyebrow labels.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E0B16", // near-black surfaces + headline text
        road: "#4A4458", // strong body text on light
        leaf: "#7C3AED", // primary violet accent (name kept for compatibility)
        glow: "#A78BFA", // light violet (gradient ends, highlights)
        mint: "#EFEAF7", // violet-tinted fill (name kept for compatibility)
        steel: "#6E6684", // muted text on light
        paper: "#F7F5FA", // page background
        bay: "#1A1526", // raised surface on dark cards
        bayline: "#3A3155", // border on dark cards
        lav: "#B9AEDF", // light lavender text on dark
        lavmute: "#8B7FB8", // muted lavender text on dark
        lavdim: "#5B5470", // dim section labels on dark
        amberline: "#d99a2b",
        danger: "#b74435",
        // Lavender-tinted neutral scale (overrides Tailwind stone) so every
        // existing border/background picks up the redesign automatically.
        stone: {
          50: "#FAF8FC",
          100: "#F1EDF8",
          200: "#EAE6F2",
          300: "#DCD5EA",
          400: "#C9BEE4",
          500: "#8B7FB8",
          600: "#6E6684",
          700: "#4A4458",
          800: "#2A2438",
          900: "#1A1526",
          950: "#0E0B16"
        }
      },
      fontFamily: {
        sans: ["Archivo", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "Menlo", "SFMono-Regular", "monospace"]
      },
      borderRadius: {
        DEFAULT: "0.5rem"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(14, 11, 22, 0.08)",
        deep: "0 24px 60px rgba(14, 11, 22, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
