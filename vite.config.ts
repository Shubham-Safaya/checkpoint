import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the GitHub Pages project path. For a custom domain,
// change to "/" (see README).
export default defineConfig({
  plugins: [react()],
  base: "/checkpoint/",
});
