// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [120, 180, 240, 360, 400, 600, 800, 1200],
      remotePatterns: [
        { protocol: "https", hostname: "**" },
        { protocol: "http", hostname: "**" },
      ],
    },
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
