import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.tsx", "./app/global.css"],
  plugins: [],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
        musy: {
          100: "hsl(var(--musy-100))",
          200: "hsl(var(--musy-200))",
          300: "hsl(var(--musy-300))",
          400: "hsl(var(--musy-400))",
          50: "hsl(var(--musy-50))",
          500: "hsl(var(--musy-500))",
          600: "hsl(var(--musy-600))",
          700: "hsl(var(--musy-700))",
          800: "hsl(var(--musy-800))",
          900: "hsl(var(--musy-900))",
          DEFAULT: "hsl(var(--musy))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
    },
  },
} satisfies Config;
