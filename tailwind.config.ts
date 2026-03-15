import type { Config } from "tailwindcss";

function oklch(variable: string) {
  return `oklch(var(--${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: oklch("background"),
        foreground: oklch("foreground"),
        card: {
          DEFAULT: oklch("card"),
          foreground: oklch("card-foreground"),
        },
        popover: {
          DEFAULT: oklch("popover"),
          foreground: oklch("popover-foreground"),
        },
        primary: {
          DEFAULT: oklch("primary"),
          foreground: oklch("primary-foreground"),
        },
        secondary: {
          DEFAULT: oklch("secondary"),
          foreground: oklch("secondary-foreground"),
        },
        muted: {
          DEFAULT: oklch("muted"),
          foreground: oklch("muted-foreground"),
        },
        accent: {
          DEFAULT: oklch("accent"),
          foreground: oklch("accent-foreground"),
        },
        destructive: {
          DEFAULT: oklch("destructive"),
        },
        border: oklch("border"),
        input: oklch("input"),
        ring: oklch("ring"),
      },
      borderColor: {
        DEFAULT: oklch("border"),
      },
      ringColor: {
        DEFAULT: oklch("ring"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
