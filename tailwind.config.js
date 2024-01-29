/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"node_modules/flowbite-react/lib/esm/**/*.js",
	],
	theme: {
		extend: {
			fontFamily: {
				primary: ["Inter"],
			},
			colors: {
				primary: { low: "#3F99F2", high: "#0066FF", md: "#1976D2" },
				secondary: {
					red: "#ff0000",
					green: "#03aa00",
					yellow: "#ffa800",
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
	plugins: [require("flowbite/plugin")],
};
