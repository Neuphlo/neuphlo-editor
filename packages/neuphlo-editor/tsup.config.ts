import { defineConfig } from "tsup"

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/react/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: !options.watch,
  sourcemap: false,
  splitting: false,
  minify: !options.watch,
  target: "es2020",
  treeshake: true,
  external: ["@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
  onSuccess: "cp src/styles.css dist/styles.css",
}))
