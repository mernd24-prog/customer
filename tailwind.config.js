/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
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
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter"],
      },
      fontSize: {
        paragraph: ["18px", "28px"],
      },
      fontWeight: {
        medium: 500,
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
