import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Fixed dev port + strictPort: Tauri's devUrl in tauri.conf.json points here.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
