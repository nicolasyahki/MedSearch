/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs basées sur le design system (variables CSS)
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          muted: 'var(--color-primary-muted)',
        },
        bg: {
          app: 'var(--color-bg-app)',
          sidebar: 'var(--color-bg-sidebar)',
          card: 'var(--color-bg-card)',
          input: 'var(--color-bg-input)',
          hover: 'var(--color-bg-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
