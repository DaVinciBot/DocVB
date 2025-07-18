/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
    block: false,
  },
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
