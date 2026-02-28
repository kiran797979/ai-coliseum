/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          cyan: '#06b6d4',
          pink: '#ec4899',
          green: '#22c55e',
          red: '#ef4444',
          dark: '#0f172a',
          darker: '#020617',
          bg: '#0a0b1e',
          card: '#1a1b3e',
          'card-border': '#2a2b5e',
          'card-hover': '#3a3b6e',
        },
        // Rank tier colors
        rank: {
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          diamond: '#b9f2ff',
          champion: '#ff6b6b',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Monaco', '"Cascadia Code"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'card-gradient': 'linear-gradient(135deg, #1a1b3e 0%, #0f1029 100%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        'fight-gradient': 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.3), 0 0 45px rgba(139, 92, 246, 0.1)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3), 0 0 45px rgba(6, 182, 212, 0.1)',
        'glow-gold': '0 0 15px rgba(245, 158, 11, 0.3), 0 0 45px rgba(245, 158, 11, 0.1)',
        'glow-pink': '0 0 15px rgba(236, 72, 153, 0.3), 0 0 45px rgba(236, 72, 153, 0.1)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.3), 0 0 45px rgba(34, 197, 94, 0.1)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3), 0 0 45px rgba(239, 68, 68, 0.1)',
        'inner-glow': 'inset 0 0 30px rgba(139, 92, 246, 0.1)',
        'card-hover': '0 0 25px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
        'fight-card': '0 0 30px rgba(239, 68, 68, 0.15), 0 0 60px rgba(139, 92, 246, 0.1)',
      },
      animation: {
        // Existing
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'float-slow': 'floatSlow 20s ease-in-out infinite',
        'float-medium': 'floatMedium 15s ease-in-out infinite',
        'float-fast': 'floatFast 10s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',

        // NEW — Battle effects
        'screen-shake': 'screenShake 0.5s ease-in-out',
        'screen-shake-hard': 'screenShakeHard 0.6s ease-in-out',
        'damage-flash': 'damageFlash 0.3s ease-out',
        'critical-hit': 'criticalHit 0.8s ease-out',
        'sword-clash': 'swordClash 0.5s ease-in-out',
        'shake-hit': 'shakeHit 0.4s ease-in-out',

        // NEW — Countdown
        'countdown-pop': 'countdownPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'countdown-fade': 'countdownFade 1s ease-out',
        'fight-text': 'fightText 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',

        // NEW — Victory
        'victory-glow': 'victoryGlow 2s ease-in-out infinite',
        'trophy-bounce': 'trophyBounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'crown-float': 'crownFloat 3s ease-in-out infinite',

        // NEW — UI polish
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'fade-in-left': 'fadeInLeft 0.4s ease-out',
        'fade-in-right': 'fadeInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'slide-in-bottom': 'slideInBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'typewriter-cursor': 'typewriterCursor 1s step-end infinite',
        'neon-flicker': 'neonFlicker 3s infinite',
        'energy-charge': 'energyCharge 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',

        // NEW — VS animation
        'vs-slam': 'vsSlam 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'vs-pulse': 'vsPulse 1.5s ease-in-out infinite',

        // NEW — Stat bars
        'stat-fill': 'statFill 1s ease-out forwards',
        'stat-glow': 'statGlow 2s ease-in-out infinite',
      },
      keyframes: {
        // Existing
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'floatSlow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 30px) scale(0.95)' },
          '75%': { transform: 'translate(20px, 20px) scale(1.02)' },
        },
        'floatMedium': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-25px, 25px) scale(1.03)' },
          '66%': { transform: 'translate(25px, -15px) scale(0.97)' },
        },
        'floatFast': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        // NEW — Screen shake (the BIG one for fights)
        'screenShake': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '10%': { transform: 'translate(-6px, -4px) rotate(-0.5deg)' },
          '20%': { transform: 'translate(6px, 2px) rotate(0.5deg)' },
          '30%': { transform: 'translate(-4px, 6px) rotate(-0.3deg)' },
          '40%': { transform: 'translate(4px, -2px) rotate(0.3deg)' },
          '50%': { transform: 'translate(-2px, 4px) rotate(-0.2deg)' },
          '60%': { transform: 'translate(2px, -4px) rotate(0.2deg)' },
          '70%': { transform: 'translate(-2px, 2px) rotate(-0.1deg)' },
          '80%': { transform: 'translate(2px, -2px) rotate(0.1deg)' },
          '90%': { transform: 'translate(-1px, 1px) rotate(0deg)' },
        },
        'screenShakeHard': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '10%': { transform: 'translate(-10px, -8px) rotate(-1deg)' },
          '20%': { transform: 'translate(10px, 6px) rotate(1deg)' },
          '30%': { transform: 'translate(-8px, 10px) rotate(-0.5deg)' },
          '40%': { transform: 'translate(8px, -4px) rotate(0.5deg)' },
          '50%': { transform: 'translate(-6px, 6px) rotate(-0.3deg)' },
          '60%': { transform: 'translate(6px, -6px) rotate(0.3deg)' },
          '70%': { transform: 'translate(-4px, 4px) rotate(-0.2deg)' },
          '80%': { transform: 'translate(4px, -2px) rotate(0.2deg)' },
          '90%': { transform: 'translate(-2px, 2px) rotate(0deg)' },
        },

        // Damage flash
        'damageFlash': {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'criticalHit': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '15%': { transform: 'scale(1.05)', filter: 'brightness(2)' },
          '30%': { transform: 'scale(0.97)', filter: 'brightness(0.8)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        'swordClash': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(15deg)' },
          '75%': { transform: 'rotate(-15deg)' },
        },
        'shakeHit': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(-4px)' },
          '20%': { transform: 'translateX(4px)' },
          '30%': { transform: 'translateX(-3px)' },
          '40%': { transform: 'translateX(3px)' },
          '50%': { transform: 'translateX(-2px)' },
        },

        // Countdown
        'countdownPop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '0.2' },
        },
        'countdownFade': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '20%': { transform: 'scale(1.2)', opacity: '1' },
          '80%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'fightText': {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(1.4) rotate(3deg)', opacity: '1' },
          '70%': { transform: 'scale(0.9) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },

        // Victory
        'victoryGlow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 0.8)',
          },
        },
        'trophyBounce': {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
          '80%': { transform: 'scale(0.9) rotate(-5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'crownFloat': {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-8px) rotate(3deg)' },
        },

        // UI polish
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fadeInDown': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fadeInLeft': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fadeInRight': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scaleIn': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slideInBottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glowPulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'borderGlow': {
          '0%, 100%': { borderColor: 'rgba(139, 92, 246, 0.3)' },
          '50%': { borderColor: 'rgba(139, 92, 246, 0.8)' },
        },
        'typewriterCursor': {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#22c55e' },
        },
        'neonFlicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            textShadow: '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #fff, 0 0 40px #8b5cf6, 0 0 80px #8b5cf6',
          },
          '20%, 24%, 55%': {
            textShadow: 'none',
          },
        },
        'energyCharge': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },

        // VS animation
        'vsSlam': {
          '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '60%': { transform: 'scale(1.5) rotate(5deg)', opacity: '1' },
          '80%': { transform: 'scale(0.85) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'vsPulse': {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3)',
            transform: 'scale(1)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(245, 158, 11, 0.8), 0 0 40px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.3)',
            transform: 'scale(1.1)',
          },
        },

        // Stat bars
        'statFill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--stat-width)' },
        },
        'statGlow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
        },
      },

      // Transition timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}