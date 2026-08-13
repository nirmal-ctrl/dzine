/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				card: 'hsl(var(--sidebar-card))',
  				border: 'hsl(var(--sidebar-border))',
  				muted: 'hsl(var(--sidebar-muted))'
  			},
  			somae: {
  				blue: 'hsl(var(--somae-blue))',
  				'blue-dark': 'hsl(var(--somae-blue-dark))',
  				'blue-tint': 'hsl(var(--somae-blue-tint))',
  				warm: 'hsl(var(--somae-warm))',
  				ink: 'hsl(var(--somae-ink))',
  				orange: 'hsl(var(--somae-orange))',
  				canvas: 'hsl(var(--somae-canvas))'
  			}
  		},
  		boxShadow: {
  			card: '0 1px 2px 0 rgb(12 12 12 / 0.03), 0 6px 18px -8px rgb(12 12 12 / 0.06)',
  			'card-hover': '0 2px 4px 0 rgb(12 12 12 / 0.04), 0 14px 32px -10px rgb(8 194 255 / 0.18)',
  			pop: '0 12px 32px -8px rgb(12 12 12 / 0.16)',
  			soft: '0 1px 2px rgb(12 12 12 / 0.03), 0 10px 28px -12px rgb(8 194 255 / 0.16)',
  			lift: '0 2px 6px rgb(12 12 12 / 0.05), 0 22px 48px -16px rgb(8 194 255 / 0.28)',
  			cta: '0 6px 20px -6px rgb(8 194 255 / 0.55), 0 2px 6px rgb(8 194 255 / 0.35)'
  		},
  		keyframes: {
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(10px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'pulse-soft': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.55' }
  			},
  			progress: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(250%)' }
  			}
  		},
  		animation: {
  			'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
  			progress: 'progress 1.4s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
