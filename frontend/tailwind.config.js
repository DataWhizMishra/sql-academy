/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Deep Matte Charcoal" canvas + "Midnight Blue" surfaces.
        background: '#12141C',
        foreground: '#FFFFFF',
        primary: '#1E212B',
        'on-primary': '#FFFFFF',
        secondary: '#262A36',
        // Primary accent — Electric Cyan (Run Query, links, active states).
        accent: '#00F0FF',
        muted: '#262A36',
        border: '#2E3340',
        // Error — Soft Coral.
        destructive: '#FF4D4D',
        // Ash Gray for secondary text / descriptions.
        'muted-foreground': '#A0A4B8',
        // Gamification + feedback accents, used sparingly over the dark base.
        gold: { DEFAULT: '#E6B981' }, // Scrabble tile wood/gold
        magenta: { DEFAULT: '#FF007F' }, // Neon magenta (reveal, advanced tier)
        cyan: { DEFAULT: '#00F0FF' }, // alias of accent for topic chips
        violet: { DEFAULT: '#B28DFF' }, // Muted purple — hints/info/exploratory
        amber: { DEFAULT: '#E6B981' }, // alias of gold for the "error" feedback tone
        rose: { DEFAULT: '#FF007F' }, // alias of magenta for the advanced tier
        success: '#00FF66', // Matrix Green — correct queries
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        // Wrong answer: quick, tight horizontal shake.
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-7px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        // Correct answer: confident pop-in.
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up-fade': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Draws the success-ring/checkmark into view.
        'check-ring': {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,102,0.0)' },
          '50%': { boxShadow: '0 0 26px 3px rgba(0,255,102,0.40)' },
        },
        confetti: {
          '0%': { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translate3d(var(--cx), var(--cy), 0) rotate(var(--cr))', opacity: '0' },
        },
      },
      animation: {
        shake: 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'check-ring': 'check-ring 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'glow-pulse': 'glow-pulse 1.1s ease-in-out 1',
        confetti: 'confetti 0.9s ease-out forwards',
      },
    },
  },
  plugins: [],
};
