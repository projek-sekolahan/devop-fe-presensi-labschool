import flowbitePlugin from "flowbite/plugin";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/flowbite-react/**/*.js",
        "./node_modules/flowbite/**/*.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                primary: ["Inter", "sans-serif"],
            },
            colors: {
                primary: { low: "#3F99F2", high: "#0066FF", md: "#1976D2" },
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