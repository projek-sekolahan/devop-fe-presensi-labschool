import flowbitePlugin from "flowbite/plugin";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{html,js,jsx,ts,tsx}",
        "./src/**/*.css",
        "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
        "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                primary: ["Inter", "sans-serif"],
            },
            colors: {
                primary: { 
                    low: "#3F99F2", 
                    high: "#0066FF", 
                    md: "#1976D2",
                    dark: '#123456',
                    300: '#93C5FD',
                    500: '#93C5FD', 
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E3A8A',
                },
                secondary: {
                    red: "#ff0000",
                    green: "#03aa00",
                    yellow: "#ffa800",
                    transparent: "transparent",
                    current: "currentColor",
                },
                bg: {
                    1: "#F5F5F5",
                    2: "#E0E0E0",
                    3: "#616161",
                    4: "#414141",
                    5: "#232323",
                },
            },
        },
    },
    plugins: [
        flowbitePlugin,
        daisyui,
    ],
    daisyui: {
        themes: ["light", "dark"],
        darkTheme: "dark",
    },
};