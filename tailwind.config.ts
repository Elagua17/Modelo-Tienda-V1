import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pool: {
          bg: "#ffffff",
          surface: "#f8fafc",
          accent: "#0d9488", // Turquesa / Teal primario
          cta: "#059669", // Verde / Esmeralda activo
          ctaHover: "#047857",
          sky: "#38bdf8", // Azul celeste para iconos, bordes sutiles y hovers
          skyLight: "#f0f9ff",
          skyBorder: "#e0f2fe",
          dark: "#0f172a",
          muted: "#64748b",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(13, 148, 136, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        card: "0 10px 30px -4px rgba(56, 189, 248, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.02)",
        glow: "0 0 25px -5px rgba(13, 148, 136, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
