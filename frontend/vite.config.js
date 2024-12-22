import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/frontend/", // Menentukan base URL untuk semua path build
  plugins: [svgr(), react(), basicSsl()],
  css: {
    postcss: {
      plugins: [tailwindcss], // Hanya gunakan Tailwind CSS
    },
  },
  server: {
    https: true, // Mengaktifkan https untuk server lokal
    proxy: {
      "/api": "https://smartapps.smalabschoolunesa1.sch.id/api", // Proxy API
    },
  },
  build: {
    outDir: ".", // Output build langsung di folder frontend/
    emptyOutDir: false, // Jangan hapus isi folder sebelum build
    sourcemap: true, // Mengaktifkan sourcemap untuk debugging
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]", // Penamaan file CSS, JS, dan lainnya
        entryFileNames: "assets/[name]-[hash].js", // Penamaan file entry point
        chunkFileNames: "assets/[name]-[hash].js", // Penamaan file chunk
      },
    },
  },
});
