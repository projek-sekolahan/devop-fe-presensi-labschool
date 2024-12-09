import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), react(), basicSsl()],
  css: {
    postcss: {
      plugins: [tailwindcss], // Hanya gunakan Tailwind CSS
    },
  },  
  server: {
    https: true, // Mengaktifkan https untuk server lokal
    proxy: {
      '/api': 'https://smartapps.smalabschoolunesa1.sch.id/api', // Proxy API
    },
  },
  build: {
    outDir: 'dist', // Menentukan direktori output untuk build
    sourcemap: true, // Mengaktifkan sourcemap untuk debugging
  },
});