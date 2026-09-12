// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   base: "/",
//   plugins: [react(), tailwindcss()],
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-ignore or cast directly
import _prerender from "@prerenderer/rollup-plugin";

const prerender = _prerender as unknown as (options: any) => any;

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    prerender({
      routes: ["/"],
      renderer: "@prerenderer/renderer-puppeteer",
      rendererOptions: {
        maxConcurrentRoutes: 1,
        renderAfterTime: 1000,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    }),
  ],
});
