import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/main.ts"],
  format: "esm",
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  banner: "#!/usr/bin/env node",
})
