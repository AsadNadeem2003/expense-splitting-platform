/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
          "on-primary-container": "#64748b",
          "secondary-container": "#f1f5f9",
          "inverse-on-surface": "#f8fafc",
          "on-secondary-container": "#64748b",
          "surface-container-high": "#f1f5f9",
          "surface-variant": "#e2e8f0",
          "background": "#F1F5F9",
          "on-surface": "#0f172a",
          "primary": "#2563eb",
          "surface-container": "#f8fafc",
          "on-surface-variant": "#64748b",
          "primary-container": "#eff6ff",
          "on-primary": "#ffffff",
          "on-background": "#0f172a"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "2xl": "1rem",
          "3xl": "1.5rem",
          "full": "9999px"
      },
      "spacing": {
          "margin-desktop": "120px",
          "lg": "48px",
          "xs": "4px",
          "xl": "80px",
          "md": "24px",
          "margin-mobile": "20px",
          "base": "8px",
          "gutter": "20px",
          "sm": "12px"
      },
      "fontFamily": {
          "body-lg": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
          "body-md": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
          "display-lg": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
          "headline-md": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
          "label-sm": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
          "numeric-lg": ["'Plus Jakarta Sans'", "Inter", "sans-serif"]
      },
      "fontSize": {
          "body-lg": ["18px", {"lineHeight": "28px", "letterSpacing": "0", "fontWeight": "400"}],
          "body-md": ["16px", {"lineHeight": "24px", "letterSpacing": "0", "fontWeight": "400"}],
          "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
          "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
          "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
          "numeric-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
      }
    }
  },
  plugins: [],
}
