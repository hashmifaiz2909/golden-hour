/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vlink-trust-deep': '#11332D',
        'vlink-trust': '#1C5C53',
        'vlink-pulse': '#FF5A4E',
        'vlink-pulse-dim': 'rgba(255, 90, 78, 0.1)',
        'vlink-paper': '#F1F4EE',
        'vlink-line': '#D9DFD6',
        'vlink-ink': '#1A2421',
        'vlink-ink-soft': '#5A6B66',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
