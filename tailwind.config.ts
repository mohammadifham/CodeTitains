import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00ffff",
          purple: "#a855f7",
          blue: "#3b82f6",
          pink: "#ec4899",
        },
      },
      spacing: {
        'neon-shadow': '10px',
      },
    },
  },
  plugins: [],
};
export default config;
