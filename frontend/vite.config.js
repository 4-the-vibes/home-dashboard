import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/public",
    emptyOutDir: true,
  },
  server: {
    // For local dev only: proxy API calls to the backend so `npm run dev`
    // works without CORS headaches. Not used in the production container.
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
