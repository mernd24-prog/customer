/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "DM Sans Fallback", "sans-serif"],
        "dm-sans": ["DM Sans", "DM Sans Fallback", "sans-serif"],
      },
      fontSize: {
        /* ── Design-system type scale ── */
        "2xs":   ["0.75rem", { lineHeight: "1rem" }],
        xs:      ["0.8125rem", { lineHeight: "1.125rem" }],
        sm:      ["0.875rem", { lineHeight: "1.25rem" }],
        base:    ["1rem", { lineHeight: "1.5rem" }],
        md:      ["1.0625rem", { lineHeight: "1.5625rem" }],
        lg:      ["1.125rem", { lineHeight: "1.625rem" }],
        xl:      ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl":   ["1.5rem", { lineHeight: "2rem" }],
        "3xl":   ["1.75rem", { lineHeight: "2.25rem" }],
        "4xl":   ["2rem", { lineHeight: "2.5rem" }],
        "5xl":   ["2.25rem", { lineHeight: "2.75rem" }],
        "6xl":   ["2.5rem", { lineHeight: "3rem" }],
        "7xl":   ["42px", { lineHeight: "50px" }],
        "8xl":   ["48px", { lineHeight: "56px" }],
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      lineHeight: {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      },
      colors: {
        primary: "#D6A323",
        surface: "#FAF6EE",
        band: "#FFF4D6",
        accent: "#D6A323",
        ink: "#1F2430",
        gray: "#A6A6A6",
        brown: "#9E886A",
        muted: "#626773",
        border: "#E4DDCF",
        divider: "#D0C4B1",
        grayBorder: "#E4DDCF",
        green: "#22A447",
        blue: "#201B78",
        navy: "#201B78",
        "navy-dark": "#15115D",
        "navy-soft": "#F0F1FF",
        gold: "#D6A323",
        "gold-dark": "#A96F14",
        "gold-soft": "#FFF4D6",
        cream: "#FAF6EE",
        "cream-strong": "#F2EADC",
        "surface-soft": "#FBFAF7",
        "border-strong": "#D0C4B1",
        success: "#22A447",
        danger: "#E23B3B",
        warning: "#D89012",
        blackbar: "#0B0B0D",
        card: {
          border: "#E4DDCF",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        custom: "8px",
        full: "9999px",
      },
      screens: {
        xs: "320px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
      keyframes: {
        "slide-fade-in": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-fade-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-20px)", opacity: "0" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(12px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "sheet-in": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-fade-in": "slide-fade-in 0.3s ease-out forwards",
        "slide-fade-out": "slide-fade-out 0.3s ease-in forwards",
        "slide-down": "slide-down 0.3s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-in forwards",
        "modal-in": "modal-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "sheet-in": "sheet-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "overlay-in": "overlay-in 0.18s ease-out forwards",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};
