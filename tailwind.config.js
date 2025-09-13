/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        float: "float 3s ease-in-out infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        "spin-slow": "spin 4s linear infinite",
        gradient: "gradient 3s ease infinite",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "100% 50%",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      colors: {
        gray: {
          "main-bg": "#E0E0E0",
        },
        // Project theme colors
        primary: {
          50: "rgba(1, 121, 202, 0.1)",
          100: "rgba(1, 121, 202, 0.2)",
          500: "rgba(1, 121, 202, 1)",
          600: "rgba(0, 107, 182, 1)",
          700: "rgba(0, 93, 162, 1)",
        },
      },
      margin: {
        2.5: "10px",
      },
      zIndex: {
        header: 10,
        sidebar: 20,
        modal: 30,
        loading: 40,
        chatbot: 9998,
        'chatbot-button': 9999,
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-gray-300': {
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgb(209 213 219)',
            'border-radius': '0.375rem',
          },
        },
        '.scrollbar-thumb-gray-600': {
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgb(75 85 99)',
            'border-radius': '0.375rem',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            'background': 'transparent',
          },
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          'width': '6px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
