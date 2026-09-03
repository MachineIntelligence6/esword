/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": {
          DEFAULT: "#71B9EA",
          dark: "rgb(27 63 87)",
          25: "#EDF5FF",
          50: "#D4EAF9",
          100: "#B8DCF4",
          700: "#2B6F9A",
          800: "#1B3F57",
        },
        "silver-light": "#F8FAFC",
        "light-green": "rgb(76 130 130)",
        "secondary": "#D4EAF9",
        // Elisen semantic tokens (docs/DESIGN.md) — brand blue kept on accent
        accent: {
          DEFAULT: "#71B9EA",
          hover: "#5AA8DC",
          subtle: "#EDF5FF",
        },
        danger: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
          active: "#991b1b",
          subtle: "#fef2f2",
        },
        success: {
          DEFAULT: "#009b65",
          subtle: "#ebfef4",
        },
        warning: {
          DEFAULT: "#e28500",
          subtle: "#fffdea",
        },
        info: {
          DEFAULT: "#71B9EA",
          subtle: "#EDF5FF",
        },
      },
      boxShadow: {
        textfield: "0 1px 2px 0 #F8FAFC",
      },
      borderRadius: {
        // Elisen DESIGN.md: 8px standard surface radius; 4px for tags/compact
        DEFAULT: "8px",
        sm: "8px",
        md: "8px",
        lg: "8px",
        xs: "4px",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
      fontFamily: {
        sans: ['"Rethink Sans"', "Inter", "system-ui", "sans-serif"],
        roman: ["'Times New Roman'", "Times", "serif"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}
