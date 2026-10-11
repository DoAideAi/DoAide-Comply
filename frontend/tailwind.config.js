export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        da: { DEFAULT: '#0D9488', light: '#14B8A6', dark: '#0F766E' },
        surface: { DEFAULT: '#FFFFFF', 2: '#F8FAFB', 3: '#F1F5F9' },
        ink: { DEFAULT: '#0F172A', 2: '#334155', 3: '#64748B' },
      },
    },
  },
  plugins: [],
};
