/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      fontSize: {
        // Display/Hero Sizes
        "display-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],

        // Heading Sizes
        "heading-xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "heading-sm": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-xs": ["18px", { lineHeight: "26px", letterSpacing: "0", fontWeight: "600" }],

        // Subheading/Section Title
        "subheading-lg": ["18px", { lineHeight: "26px", letterSpacing: "0", fontWeight: "600" }],
        "subheading-md": ["16px", { lineHeight: "24px", letterSpacing: "0", fontWeight: "600" }],
        "subheading-sm": ["14px", { lineHeight: "22px", letterSpacing: "0", fontWeight: "600" }],

        // Body Text
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "22px", letterSpacing: "0", fontWeight: "400" }],
        "body-xs": ["13px", { lineHeight: "20px", letterSpacing: "0", fontWeight: "400" }],

        // Small Text
        "caption-lg": ["14px", { lineHeight: "22px", letterSpacing: "0", fontWeight: "500" }],
        "caption-md": ["13px", { lineHeight: "20px", letterSpacing: "0", fontWeight: "500" }],
        "caption-sm": ["12px", { lineHeight: "18px", letterSpacing: "0", fontWeight: "500" }],

        // Label/Badge/Button Text
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.5px", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "20px", letterSpacing: "0.5px", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.5px", fontWeight: "600" }],
        "label-xs": ["11px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "600" }],

        // Overline/Tag
        "overline": ["12px", { lineHeight: "16px", letterSpacing: "1px", fontWeight: "600", textTransform: "uppercase" }],

        // Preserve legacy sizes for backwards compatibility
        paragraph: ["18px", "28px"],
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
        muted: "#6F7480",
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
