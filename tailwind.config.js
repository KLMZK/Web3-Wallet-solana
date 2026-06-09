module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        'xp-bg': '#10131c',
        'xp-surface': '#1a2535',
        'xp-gold': '#dea001',
        'xp-text': '#f0f4f8',
        'xp-muted': '#7a8fa6',
        'xp-danger': '#ff4a4a',
        'xp-green': '#4ade80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
    require("@tailwindcss/typography")
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        'solana': {
          fontFamily: {
            display: ['PT Mono, monospace'],
            body: ['Inter, sans-serif'],
          },
          'primary': '#dea001',
          'primary-focus': '#c88e01',
          'primary-content': '#10131c',

          'secondary': '#1a2535',
          'secondary-focus': '#243246',
          'secondary-content': '#f0f4f8',

          'accent': '#dea001',
          'accent-focus': '#c88e01',
          'accent-content': '#10131c',

          'neutral': '#10131c',
          'neutral-focus': '#181c27',
          'neutral-content': '#f0f4f8',

          'base-100': '#10131c',
          'base-200': '#181c27',
          'base-300': '#1a2535',
          'base-content': '#f0f4f8',

          'info': '#2094f3',
          'success': '#4ade80',
          'warning': '#dea001',
          'error': '#ff4a4a',
        },
      },
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}