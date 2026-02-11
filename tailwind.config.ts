import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Bungee", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Karla", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#101113",
        candy: {
          50: "#fff5f7",
          100: "#ffe4ea",
          200: "#ffc8d7",
          300: "#ff9eb8",
          400: "#ff6ea0",
          500: "#ff3d86",
          600: "#f51a6f",
          700: "#d5125f",
          800: "#a80f4c",
          900: "#7a0b37"
        },
        limepop: {
          50: "#f6ffe8",
          100: "#e7ffbf",
          200: "#d2ff8a",
          300: "#b7ff4d",
          400: "#9cf717",
          500: "#7cdd00",
          600: "#60b200",
          700: "#4b8b00",
          800: "#3d6e00",
          900: "#305400"
        },
        skybolt: {
          50: "#ecfbff",
          100: "#d2f4ff",
          200: "#a6e9ff",
          300: "#70d8ff",
          400: "#3cc6ff",
          500: "#1aa8ff",
          600: "#0e86d6",
          700: "#0d6aaa",
          800: "#0f5787",
          900: "#10486e"
        },
        sunshine: {
          50: "#fffde9",
          100: "#fff8c5",
          200: "#fff28d",
          300: "#ffe64d",
          400: "#ffd81a",
          500: "#f5bd00",
          600: "#d19000",
          700: "#a46600",
          800: "#845100",
          900: "#6b4100"
        }
      },
      boxShadow: {
        glow: "0 10px 30px rgba(255, 61, 134, 0.25)",
        card: "0 12px 30px rgba(16, 17, 19, 0.08)"
      },
      backgroundImage: {
        "hero-splash": "radial-gradient(circle at 20% 20%, rgba(255, 61, 134, 0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(26, 168, 255, 0.35), transparent 45%), radial-gradient(circle at 70% 70%, rgba(156, 247, 23, 0.35), transparent 45%), linear-gradient(135deg, #fff5f7, #f3fbff 45%, #fffde9 100%)"
      }
    }
  },
  plugins: []
};

export default config;
