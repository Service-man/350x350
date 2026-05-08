import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        road: "#29332d",
        leaf: "#2f7d54",
        mint: "#dcefe5",
        steel: "#60706a",
        paper: "#f7f5ef",
        amberline: "#d99a2b",
        danger: "#b74435"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 33, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
