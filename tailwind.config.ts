import type { Config } from "tailwindcss";

// Apex Legends palette — deep arena black, blood-red, plasma cyan, EVO gold,
// nessie green. Tuned for OLED + mobile readability.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08090B",
        surface: "#11131A",
        surface2: "#1A1D26",
        line: "#252934",
        ink: "#F5F5F7",
        muted: "#7A7F8C",
        // brand
        blood: "#E63946",        // apex red
        bloodDim: "#A91D2A",
        plasma: "#22D3EE",       // scan / cyan
        nessie: "#3DDC97",        // green
        gold: "#F4B400",          // evo gold / level 4
        violet: "#9B5DE5",        // legendary
        // EVO shield tiers
        evoWhite: "#E5E7EB",
        evoBlue: "#3B82F6",
        evoPurple: "#9B5DE5",
        evoGold: "#F4B400",
        evoRed: "#E63946",
        // Ranked tiers
        tierPred: "#E63946",
        tierMaster: "#9B5DE5",
        tierDia: "#22D3EE",
        tierPlat: "#3DDC97",
        tierGold: "#F4B400",
        tierSilver: "#C0C0C0",
        tierBronze: "#CD7F32",
        tierRook: "#7A7F8C",
        // Generic tier-list colors used by components
        tierS: "#E63946",
        tierA: "#F4B400",
        tierB: "#22D3EE",
        tierC: "#3DDC97",
        tierD: "#7A7F8C",
      },
      fontFamily: {
        display: ['"Teko"', '"Bebas Neue"', "Impact", "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(230,57,70,0.45), 0 0 32px rgba(230,57,70,0.25)",
        glowPlasma: "0 0 0 1px rgba(34,211,238,0.4), 0 0 32px rgba(34,211,238,0.2)",
        glowGold: "0 0 0 1px rgba(244,180,0,0.5), 0 0 32px rgba(244,180,0,0.25)",
      },
      backgroundImage: {
        "hex-grid":
          "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        "fade-bottom": "linear-gradient(180deg, transparent, rgba(8,9,11,1))",
        "blood-grad": "linear-gradient(135deg, #E63946 0%, #F4B400 100%)",
        "plasma-grad": "linear-gradient(135deg, #22D3EE 0%, #3DDC97 100%)",
        "evo-grad": "linear-gradient(135deg, #9B5DE5 0%, #F4B400 100%)",
      },
      animation: {
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        marquee: "marquee 30s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        scan: "scan 2.5s linear infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230,57,70,0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(230,57,70,0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0.6" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
