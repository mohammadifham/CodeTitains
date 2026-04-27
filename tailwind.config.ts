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
          blue: "#3b82f6",
          purple: "#a855f7",
          pink: "#ec4899",
          green: "#10b981",
        },
        panel: {
          bg: "rgba(9, 17, 34, 0.65)",
          border: "rgba(106, 206, 255, 0.15)",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px -5px rgba(0, 255, 255, 0.5)' },
          'to': { boxShadow: '0 0 20px 5px rgba(0, 255, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
