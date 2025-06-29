
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Manrope', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Textos del sistema
				'caption': ['11px', { lineHeight: '16px' }],    // Captions, timestamps
				'small': ['12px', { lineHeight: '16px' }],      // Labels, badges
				'body-sm': ['13px', { lineHeight: '18px' }],    // Tablas, formularios pequeños
				'body': ['14px', { lineHeight: '20px' }],       // Texto principal UI
				'body-lg': ['16px', { lineHeight: '24px' }],    // Contenido, lectura
				
				// Títulos
				'h6': ['14px', { lineHeight: '20px', fontWeight: '600' }],
				'h5': ['16px', { lineHeight: '24px', fontWeight: '600' }],
				'h4': ['18px', { lineHeight: '28px', fontWeight: '600' }],
				'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
				'h2': ['24px', { lineHeight: '32px', fontWeight: '700' }],
				'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
				
				// Display (para landing pages, headers principales)
				'display-sm': ['36px', { lineHeight: '44px', fontWeight: '700' }],
				'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
				
				// Mantener tamaños Tailwind estándar para compatibilidad
				'xs': ['12px', { lineHeight: '16px' }],
				'sm': ['14px', { lineHeight: '20px' }],
				'base': ['16px', { lineHeight: '24px' }],
				'lg': ['18px', { lineHeight: '28px' }],
				'xl': ['20px', { lineHeight: '28px' }],
				'2xl': ['24px', { lineHeight: '32px' }],
				'3xl': ['30px', { lineHeight: '36px' }],
				'4xl': ['36px', { lineHeight: '40px' }],
				'5xl': ['48px', { lineHeight: '1' }],
				'6xl': ['60px', { lineHeight: '1' }],
				'7xl': ['72px', { lineHeight: '1' }],
				'8xl': ['96px', { lineHeight: '1' }],
				'9xl': ['128px', { lineHeight: '1' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: '3px',
				md: '3px',
				sm: '3px'
			},
			borderWidth: {
				'0.5': '0.5px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
