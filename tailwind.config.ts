
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
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Sistema tipográfico según spec LegalCRM
				'xs': ['12px', { lineHeight: '16px' }],
				'sm': ['14px', { lineHeight: '20px' }],
				'base': ['16px', { lineHeight: '24px' }],
				'lg': ['18px', { lineHeight: '28px' }],
				'xl': ['20px', { lineHeight: '28px' }],
				'2xl': ['24px', { lineHeight: '32px' }],
				'3xl': ['30px', { lineHeight: '36px' }],
			},
			colors: {
				// Sistema de colores LegalCRM
				border: 'hsl(210 40% 92%)', // slate-200
				input: 'hsl(210 40% 92%)', // slate-200
				ring: 'hsl(221 83% 53%)', // blue-600
				background: 'hsl(210 40% 98%)', // slate-50
				foreground: 'hsl(222 84% 5%)', // slate-900
				
				primary: {
					DEFAULT: 'hsl(221 83% 53%)', // blue-600
					foreground: 'hsl(0 0% 100%)', // white
				},
				secondary: {
					DEFAULT: 'hsl(210 40% 94%)', // slate-100
					foreground: 'hsl(222 84% 5%)', // slate-900
				},
				destructive: {
					DEFAULT: 'hsl(0 84% 60%)', // red-500
					foreground: 'hsl(0 0% 100%)', // white
				},
				muted: {
					DEFAULT: 'hsl(210 40% 96%)', // slate-100
					foreground: 'hsl(215 16% 47%)', // slate-600
				},
				accent: {
					DEFAULT: 'hsl(214 100% 97%)', // blue-50
					foreground: 'hsl(221 83% 53%)', // blue-600
				},
				popover: {
					DEFAULT: 'hsl(0 0% 100%)', // white
					foreground: 'hsl(222 84% 5%)', // slate-900
				},
				card: {
					DEFAULT: 'hsl(0 0% 100%)', // white
					foreground: 'hsl(222 84% 5%)', // slate-900
				},
				sidebar: {
					DEFAULT: 'hsl(0 0% 100%)', // white
					foreground: 'hsl(215 16% 47%)', // slate-600
					primary: 'hsl(221 83% 53%)', // blue-600
					'primary-foreground': 'hsl(0 0% 100%)', // white
					accent: 'hsl(214 100% 97%)', // blue-50
					'accent-foreground': 'hsl(221 83% 53%)', // blue-600
					border: 'hsl(210 40% 92%)', // slate-200
					ring: 'hsl(221 83% 53%)', // blue-600
				}
			},
			borderRadius: {
				lg: '8px', // 0.5rem según spec
				md: '8px',
				sm: '6px'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
