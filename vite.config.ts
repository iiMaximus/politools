import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" keeps asset paths relative so a production build also works when
// opened straight from the filesystem or served from a sub-path (matches the
// "just open it" workflow of the older static sites). Routing uses HashRouter
// for the same reason.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
});
