/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
          "on-primary-container": "#7e7d7d",
          "secondary-container": "#47475d",
          "inverse-on-surface": "#313030",
          "on-secondary-container": "#b8b6d0",
          "surface-container-high": "#2b2a2a",
          "surface-variant": "#353434",
          "background": "#141313",
          "on-surface": "#e5e2e1",
          "primary": "#c8c6c5",
          "surface-container": "#201f1f",
          "on-surface-variant": "#c4c7c7",
          "primary-container": "#121212",
          "on-primary": "#313030"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
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
          "body-lg": ["Inter"],
          "body-md": ["Inter"],
          "display-lg": ["Inter"],
          "headline-md": ["Inter"],
          "label-sm": ["Inter"],
          "numeric-lg": ["Inter"]
      },
      "fontSize": {
          "body-lg": ["18px", {"lineHeight": "28px", "letterSpacing": "0", "fontWeight": "400"}],
          "body-md": ["16px", {"lineHeight": "24px", "letterSpacing": "0", "fontWeight": "400"}],
          "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
          "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
          "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
          "numeric-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "500"}]
      }
    }
  },
  plugins: [],
}
