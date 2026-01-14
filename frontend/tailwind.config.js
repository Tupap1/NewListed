export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc', // Slate 50
                surface: '#ffffff',
                primary: {
                    DEFAULT: '#0f172a', // Slate 900
                    hover: '#334155',   // Slate 700
                },
                accent: '#3b82f6',    // Blue 500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
