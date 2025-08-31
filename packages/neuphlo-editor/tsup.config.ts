import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts', 'src/react/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Avoid unlink/clean races while watching
  clean: !options.watch,
  sourcemap: true,
  target: 'es2020',
  treeshake: true,
  onSuccess: 'cp src/styles.css dist/styles.css',
}))
