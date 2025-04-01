import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    build: {
      outDir: "./build",
    },
    plugins: [react(), eslint(),  tailwindcss(),],
    server: {
      host: "127.0.0.1",
      port: 4000,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:3000`,
          changeOrigin: false,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
