import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      // ─── Colours ────────────────────────────────────────────────────────────
      colors: {
        // Primary brand blue (used for buttons, links, focus rings)
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },

        // Status colours — used across record states and transaction feedback
        status: {
          // Verified / success
          verified:     "#16a34a",
          "verified-bg": "#f0fdf4",
          "verified-border": "#bbf7d0",

          // Pending / warning
          pending:      "#d97706",
          "pending-bg": "#fffbeb",
          "pending-border": "#fde68a",

          // Failed / error
          failed:       "#dc2626",
          "failed-bg":  "#fef2f2",
          "failed-border": "#fecaca",

          // Inactive / muted
          inactive:     "#9ca3af",
          "inactive-bg": "#f9fafb",
          "inactive-border": "#e5e7eb",
        },

        // Blockchain / on-chain accent (subtle teal-green)
        chain: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          400: "#2dd4bf",
          600: "#0d9488",
          700: "#0f766e",
          900: "#134e4a",
        },

        // Surface shorthands — mirrors what the layout already uses
        surface: {
          DEFAULT: "rgba(255,255,255,0.80)",   // bg-white/80 cards
          overlay: "rgba(255,255,255,0.70)",   // bg-white/70 layout overlay
          glass:   "rgba(255,255,255,0.40)",   // bg-white/40 section bands
          header:  "rgba(255,255,255,0.95)",   // bg-white/95 sticky header
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },

      fontSize: {
        // Extra-small labels used in hash displays and meta info
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ─── Spacing / Sizing ───────────────────────────────────────────────────
      maxWidth: {
        // Matches the max-w-7xl layout container used across all pages
        layout: "80rem",
        prose:  "65ch",
        form:   "42rem",
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        // Larger pill shape for the "Evaluation Network" badge
        pill: "9999px",
        // Cards and modals use xl (already in default, listed here for docs)
        card: "0.75rem",
      },

      // ─── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        // Subtle card shadow matching existing shadow-sm usage
        card:    "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        // Stronger elevation for modals / dialogs
        modal:   "0 20px 60px -10px rgb(0 0 0 / 0.25)",
        // Glow effect for verified/on-chain states
        "glow-brand": "0 0 0 3px rgb(59 130 246 / 0.35)",
        "glow-chain": "0 0 0 3px rgb(13 148 136 / 0.30)",
      },

      // ─── Backdrop Blur ──────────────────────────────────────────────────────
      backdropBlur: {
        // Used on the layout overlay and sticky header
        xs:   "2px",
        card: "8px",
      },

      // ─── Transitions / Animation ────────────────────────────────────────────
      transitionDuration: {
        DEFAULT: "150ms",
        fast:    "100ms",
        slow:    "300ms",
      },

      keyframes: {
        // Subtle fade-in for cards and record lists
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
        // Spinner for pending transaction states
        spin: {
          from: { transform: "rotate(0deg)"   },
          to:   { transform: "rotate(360deg)" },
        },
        // Pulse glow for active blockchain connection indicator
        "pulse-glow": {
          "0%, 100%": { opacity: "1"   },
          "50%":      { opacity: "0.4" },
        },
        // Checkmark draw for verification success
        "draw-check": {
          from: { strokeDashoffset: "24" },
          to:   { strokeDashoffset: "0"  },
        },
      },

      animation: {
        "fade-in":    "fade-in 200ms ease-out both",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "draw-check": "draw-check 0.4s ease-out forwards",
      },

      // ─── Z-Index scale ──────────────────────────────────────────────────────
      zIndex: {
        // Explicit named layers to avoid magic numbers
        header:  "40",
        modal:   "50",
        tooltip: "60",
        toast:   "70",
      },

      // ─── Grid / Layout helpers ──────────────────────────────────────────────
      gridTemplateColumns: {
        // Record card grid: sidebar hash + main content
        "record-detail": "minmax(0, 1fr) minmax(0, 2fr)",
        // Fact strip on landing page (4 up)
        facts: "repeat(4, minmax(0, 1fr))",
      },
    },
  },

  // ─── Plugins ────────────────────────────────────────────────────────────────
  plugins: [
    // Utility: .glass — the frosted-glass panel pattern used throughout the app
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".glass": {
          backgroundColor: theme("colors.surface.DEFAULT"),
          backdropFilter:  "blur(8px)",
          border:          `1px solid ${theme("colors.gray.200")}`,
          borderRadius:    theme("borderRadius.xl"),
        },
        ".glass-sm": {
          backgroundColor: theme("colors.surface.glass"),
          backdropFilter:  "blur(4px)",
          border:          `1px solid ${theme("colors.gray.100")}`,
          borderRadius:    theme("borderRadius.lg"),
        },
      });
    }),

    // Utility: .hash-display — monospace truncation for keccak hashes
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".hash-display": {
          fontFamily:    (Array.isArray(theme("fontFamily.mono")) ? theme("fontFamily.mono") : [theme("fontFamily.mono")]).join(", "),
          fontSize:      theme("fontSize.xs")[0],
          letterSpacing: theme("letterSpacing.tight"),
          overflowWrap:  "anywhere",
          wordBreak:     "break-all",
          color:         theme("colors.gray.700"),
        },
      });
    }),

    // Utility: .status-badge — coloured pill used on record cards
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".status-badge": {
          display:       "inline-flex",
          alignItems:    "center",
          gap:           theme("spacing.1"),
          borderRadius:  theme("borderRadius.full"),
          paddingTop:    theme("spacing.0.5"),
          paddingBottom: theme("spacing.0.5"),
          paddingLeft:   theme("spacing.2"),
          paddingRight:  theme("spacing.2"),
          fontSize:      theme("fontSize.xs")[0],
          fontWeight:    theme("fontWeight.medium"),
          lineHeight:    theme("lineHeight.tight"),
        },
        ".status-badge-verified": {
          color:           theme("colors.status.verified"),
          backgroundColor: theme("colors.status.verified-bg"),
          borderWidth:     "1px",
          borderColor:     theme("colors.status.verified-border"),
        },
        ".status-badge-pending": {
          color:           theme("colors.status.pending"),
          backgroundColor: theme("colors.status.pending-bg"),
          borderWidth:     "1px",
          borderColor:     theme("colors.status.pending-border"),
        },
        ".status-badge-failed": {
          color:           theme("colors.status.failed"),
          backgroundColor: theme("colors.status.failed-bg"),
          borderWidth:     "1px",
          borderColor:     theme("colors.status.failed-border"),
        },
        ".status-badge-inactive": {
          color:           theme("colors.status.inactive"),
          backgroundColor: theme("colors.status.inactive-bg"),
          borderWidth:     "1px",
          borderColor:     theme("colors.status.inactive-border"),
        },
      });
    }),
    require('animatecss-tailwind-adapter')({
    duration: '500ms', // Change default animation duration
    delay: '1s', // Add default delay
    iterationCount: '3' // Make animations repeat infinitely
    })
  ],
};

export default config;
