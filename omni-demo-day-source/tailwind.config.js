/**
 * Sciton OMNI tokens.
 * Colours: OMNI Brand Guidelines (primary + secondary marketing palettes) and the live
 * sciton.com/omnilaserhairremoval page (plum radial gradient, pill buttons, Playfair italic accents).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', '../Sciton Landing Pages/omni-demo-day/assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'rich-black': '#000000',
        hibiscus: { DEFAULT: '#8C5A5E', light: '#A97A7E' },
        'omni-gray': '#878787',
        // Secondary palette for marketing assets
        plum: { DEFAULT: '#5A2936', deep: '#3B1B24', night: '#1C0B10' },
        pink: { DEFAULT: '#DBB7BB', soft: '#EBD9DA', mist: '#F6EFEE' },
        khaki: '#B6A999',
        brown: '#5F4B3C',
        // Text on light sections
        ink: '#1E1215',
        muted: '#6E5C60',
        line: 'rgba(90, 41, 54, 0.14)',
      },
      fontFamily: {
        sans: ['"itc-avant-garde-gothic-pro"', '"Avant Garde"', 'Futura', '"Century Gothic"', 'Arial', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(40px, 4.4vw, 64px)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        h2: ['clamp(34px, 4.1vw, 58px)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        h3: ['clamp(26px, 2.4vw, 34px)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        card: '20px',
        panel: '28px',
      },
      boxShadow: {
        card: '0 12px 34px rgba(28, 11, 16, 0.08)',
        float: '0 30px 80px rgba(0, 0, 0, 0.35)',
        glow: '0 0 120px 40px rgba(140, 90, 94, 0.35)',
      },
      maxWidth: {
        wrap: '1280px',
      },
      backgroundImage: {
        // Measured from the live OMNI page body.
        'omni-radial': 'radial-gradient(189% 91% at -10.2% 39.3%, #000000 0%, #5A2936 37.32%, #3B1B24 71%, #000000 100%)',
        'omni-radial-alt': 'radial-gradient(160% 95% at 110% 20%, #000000 0%, #5A2936 36%, #3B1B24 70%, #000000 100%)',
      },
    },
  },
  plugins: [],
};
