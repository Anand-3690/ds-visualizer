import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Required for GitHub Pages project sites (served at /<repo-name>/).
  // Only applied on `npm run build` so `npm run dev` still serves from "/".
  // Change "ds-visualizer" to match your repo name exactly.
  base: command === "build" ? "/ds-visualizer/" : "/",
}));
