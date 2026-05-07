import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: { cert: "../../localhost.pem", key: "../../localhost-key.pem" },
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
