import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  // Base URL untuk path build
  base: "/frontend/",

  // Plugins yang digunakan
  plugins: [
    svgr(),        // Support import SVG sebagai React component
    react(),       // Plugin React
    basicSsl(),    // Menyediakan HTTPS di server lokal
  ],

  esbuild: {
    jsxInject: `import React from 'react'`, // Menambahkan React secara otomatis untuk JSX
  },
  
  // Definisi variabel lingkungan
  define: {
    'process.env': process.env, // Menyediakan akses ke environment variables
  },

  // Konfigurasi CSS dengan PostCSS
  css: {
    postcss: {
      plugins: [
        tailwindcss,  // Integrasi Tailwind CSS
        autoprefixer, // Menambahkan prefix untuk kompatibilitas browser
      ],
    },
  },

  // Konfigurasi untuk development server
  server: {
    https: true, // Mengaktifkan HTTPS di server lokal
    proxy: {
      "/api": "https://smartapps.smalabschoolunesa1.sch.id/api", // Proxy untuk permintaan API
    },
  },

  // Konfigurasi build
  build: {
    outDir: ".",          // Output build di folder saat ini
    emptyOutDir: false,  // Jangan hapus isi folder sebelum build
    sourcemap: true,  // Mengaktifkan sourcemap untuk debugging
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]", // Penamaan file untuk asset (CSS, JS, dll)
        entryFileNames: "assets/[name]-[hash].js",       // Penamaan file entry point
        chunkFileNames: "assets/[name]-[hash].js",       // Penamaan file untuk chunk
      },
    },
    // Konfigurasi untuk Web Worker
    worker: {
      format: "es", // Gunakan format ES Module untuk worker
      rollupOptions: {
        output: {
          entryFileNames: "workers/[name]-[hash].js", // Penamaan khusus untuk worker
        },
      },
    },
  },
});