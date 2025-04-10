import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";
import inject from "@rollup/plugin-inject";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      global: "globalthis",
      buffer: "buffer",
      process: "process/browser",
    },
  },
  server: {
    host: true,
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  optimizeDeps: {
    include: ["buffer", "process"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(),
        inject({
          Buffer: ["buffer", "Buffer"],
          process: "process",
        }),
      ],
    },
  },
  preview: {
    allowedHosts: ["brieffy-frontend.onrender.com"],
  },
});
